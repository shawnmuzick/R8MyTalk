/**
 * This file contains controllers related to speaker data for views
 */
import { doc, getDoc, updateDoc } from "@firebase/firestore";
import { getAuth } from "firebase-admin/auth";
import {
  deleteObject,
  getDownloadURL,
  listAll,
  ref,
  uploadBytes,
} from "firebase/storage";
import { db, storage } from "../index.js";
import { Speaker } from "../models/Speaker.js";

export async function getSpeakers() {
  const users = [];
  try {
    const listAllUsers = async (nextPageToken) => {
      const page = await getAuth().listUsers(1000, nextPageToken);
      page.users.forEach((userRecord) => {
        users.push(
          new Speaker({
            uid: userRecord.uid,
            displayName: userRecord.displayName,
          }),
        );
      });
      if (page.pageToken) {
        // get the next page if there is one
        listAllUsers(page.pageToken);
      }
    };
    //run the above, recursively, and return the result
    await listAllUsers();
    return users;
  } catch (error) {
    console.log("Error listing users:", error);
  }
}

export async function searchUsers(searchQuery) {
  try {
    let matchingUsers = [];
    const allUsers = await getSpeakers();
    await Promise.all(
      allUsers.map(async (u) => {
        u.populateProfile(await getSpeakerProfile(u.uid));
      }),
    );
    // Filter the users based on the search query
    matchingUsers = allUsers.filter((user) => {
      const displayName = `${user.displayName}`.toLowerCase();
      const lastName = `${user.profile.lastName}`.toLowerCase();
      const firstName = `${user.profile.firstName}`.toLowerCase();
      return (
        displayName.includes(searchQuery.toLowerCase()) ||
        lastName.includes(searchQuery.toLowerCase()) ||
        firstName.includes(searchQuery.toLowerCase())
      );
    });

    return matchingUsers;
  } catch (error) {
    console.log("Error searching users:", error);
    throw error;
  }
}

export async function getSpeakerProfile(uid) {
  try {
    const userRef = doc(db, "theFireUsers", uid);
    const userDoc = await getDoc(userRef);
    const data = userDoc.data();
    const profilePictureUrl = await getProfilePictureURL(uid);
    return {
      firstName: data?.firstName ?? "",
      lastName: data?.lastName ?? "",
      bio: data?.Bio ?? "",
      socialLink1: data?.socialLink1 ?? "",
      socialLink2: data?.socialLink2 ?? "",
      socialLink3: data?.socialLink3 ?? "",
      profilePictureUrl: profilePictureUrl ?? "",
    };
  } catch (error) {
    console.log("Error getting data: ", error);
    throw error;
  }
}

export async function getProfilePictureURL(uid) {
  try {
    //get the picture path from the profilePicture folder
    const folderRef = ref(storage, `${uid}/profilePicture`);
    const list = await listAll(folderRef);
    //there should only ever be one profile picture
    const path = list?.items[0]?._location?.path_ ?? null;

    if (!path) {
      return null;
    }
    //use the path to get a download url for it
    const storageRef = ref(storage, path);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getStorageItems(uid) {
  try {
    const items = [];
    const storageRef = ref(storage, `${uid}/profilePicture`);
    const list = await listAll(storageRef);
    for (const item of list.items) {
      items.push(item);
    }
    return items;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function deleteStorageItem(itemRef) {
  try {
    const result = await deleteObject(itemRef);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

/**Blow out everything in the profilePicture folder,
 * there should only ever be one item
 */
export async function deleteProfilePicture(uid) {
  try {
    const storageRef = ref(storage, `${uid}/profilePicture`);
    const list = await listAll(storageRef);
    await Promise.all(
      list.items.map(async (itemRef) => {
        await deleteStorageItem(itemRef);
      }),
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
}

/** Upload a new user profile picture in the /profilePicture folder,
 *  named profilePicture
 */
export async function uploadProfilePicture(file, uid) {
  try {
    const metadata = {
      contentType: file.mimetype,
    };
    //delete whatever's in there now
    await deleteProfilePicture(uid);

    //upload the new one
    const storageRef = ref(storage, `${uid}/profilePicture/profilePicture`);
    const result = await uploadBytes(storageRef, file.buffer, metadata);

    //return the url path to the new file
    const newFileUrl = await getProfilePictureURL(uid);
    console.log("uploaded file");
    return newFileUrl;
  } catch (error) {
    console.error("problem uploading", error);
    throw error;
  }
}

export async function updateSpeakerProfile(req) {
  try {
    const user = req.session.user;
    const uid = req.params.id;
    const { bio, socialLink1, socialLink2, socialLink3 } = req.body;

    // Check if the user is updating their own profile
    if (user.uid !== uid) {
      return res
        .status(403)
        .send("You are not authorized to update this profile.");
    }

    // Update the user's profile data in the database
    const userRef = doc(db, "theFireUsers", uid);
    const result = await updateDoc(userRef, {
      Bio: bio,
      socialLink1,
      socialLink2,
      socialLink3,
    });
  } catch (error) {
    console.log("Error updating speaker profile: ", error);
    throw error;
  }
}

export const Speakers = {
  list: async (req, res) => {
    try {
      const users = await getSpeakers();
      res.status(200).json({ data: users });
    } catch (error) {
      console.log("Error getting speaker list: ", error);
      res.status(500).send({ message: error });
    }
  },
  getProfile: async (req, res) => {
    try {
      const profile = await getSpeakerProfile(req.params.id);
      res.status(200).json({ data: profile });
    } catch (error) {
      console.log("Error getting data: ", error);
      res.status(500).send({ message: error });
    }
  },
  updateProfile: async (req, res) => {
    try {
      await updateSpeakerProfile(req);
      res.status(200).json({ message: "profile data updated" });
    } catch (error) {
      console.log("Error updating profile data:", error);
      res.status(500).send({ message: error });
    }
  },
  updatePicture: async (req, res) => {
    try {
      const file = req.file; //from multer
      const uid = req.params.id;
      const result = await uploadProfilePicture(file, uid);
      res.status(200).json({ newProfilePictureUrl: result });
    } catch (error) {
      console.log(`problem uploading file ${error}`);
      res.status(500).send({ message: error });
    }
  },
  getProfilePicture: async (req, res) => {
    try {
      const pictureUrl = await getProfilePictureURL(req.params.id);
      res.status(200).json({ data: pictureUrl });
    } catch (error) {
      console.log("Error getting profile picture: ", error);
      res.status(500).send({ message: error });
    }
  },
  searchSpeakers: async (req, res) => {
    try {
      const searchQuery = req.query.q;
      const matchingUsers = await searchUsers(searchQuery);
      res.status(200).json({ data: matchingUsers });
    } catch (error) {
      console.log("Error searching users:", error);
      res.status(500).send({ message: error });
    }
  },
  getStorage: async (req, res) => {
    try {
      const itemList = await getStorageItems(req.params.id);
      res.status(200).json({ data: itemList });
    } catch (error) {
      console.log("Error searching storage:", error);
      res.status(500).send({ message: error });
    }
  },
};

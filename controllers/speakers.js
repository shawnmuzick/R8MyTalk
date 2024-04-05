/**
 * This file contains controllers related to speaker data for views
 */

import { doc, getDoc } from "@firebase/firestore";
import { getAuth } from "firebase-admin/auth";
import { getDownloadURL, listAll, ref } from "firebase/storage";
import { db, storage } from "../index.js";

export async function getSpeakers() {
  const users = [];
  try {
    const listAllUsers = async (nextPageToken) => {
      const page = await getAuth().listUsers(1000, nextPageToken);
      page.users.forEach((userRecord) => {
        users.push({
          uid: userRecord.uid,
          displayName: userRecord.displayName,
        });
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
        u.profile = await getSpeakerProfile(u.uid);
      }),
    );
    // Filter the users based on the search query
    matchingUsers = allUsers.filter((user) => {
      console.log(user);
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
    return {
      firstName: data?.firstName ?? "",
      lastName: data?.lastName ?? "",
      bio: data?.Bio ?? "",
      socialLink1: data?.socialLink1 ?? "",
      socialLink2: data?.socialLink2 ?? "",
      socialLink3: data?.socialLink3 ?? "",
    };
  } catch (error) {
    console.log("Error getting data: ", error);
    throw error;
  }
}

export async function getProfilePictureURL(uid) {
  try {
    //get the picture path from the profilePicture folder
    let path = null;
    const folderRef = ref(storage, uid + "/profilePicture");
    const list = await listAll(folderRef);
    //there should only ever be one profile picture
    list.items.forEach((item) => (path = item._location.path_));

    if (path) {
      //use the path to get a download url for it
      const storageRef = ref(storage, path);
      const url = await getDownloadURL(storageRef);
      return url;
    } else {
      return null;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getStorageItems(uid) {
  try {
    const items = [];
    const storageRef = ref(storage, uid + "/profilePicture");
    const list = await listAll(storageRef);
    console.log("list", list);
    list.items.forEach((item) => items.push(item));

    return items;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function uploadProfilePicture(file, uid) {
  try {
    const metadata = {
      contentType: file.mimetype,
    };
    const storageRef = ref(
      storage,
      uid + "/" + "profilePicture/" + file.fieldName,
    );
    const result = await uploadBytes(storageRef, file.buffer, metadata);
    return result;
  } catch (error) {
    console.error("problem uploading", error);
    throw error;
  }
}

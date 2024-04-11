const form = document.getElementById("profile-form");
const bioInput = document.getElementById("bio");
const socialLink1Input = document.getElementById("socialLink1");
const socialLink2Input = document.getElementById("socialLink2");
const socialLink3Input = document.getElementById("socialLink3");
const editPicture = document.getElementById("btn-edit-picture");

/**This eventListener creates a file input on click and opens the file picker to prompt the user to select a file */
editPicture.addEventListener("click", async (event) => {
  try {
    event.preventDefault();
    //create the input, prompt for file
    const inputElem = document.createElement("input");
    inputElem.type = "file";
    inputElem.name = "uploadedFile";
    inputElem.id = "uploadedFile";

    //hand the image off to this callback when selected
    inputElem.addEventListener("change", handlePictureSelection);
    inputElem.click();
  } catch (error) {
    console.log(error);
  }
});

/**This function uploads the file after the user selects it */
async function handlePictureSelection(event) {
  try {
    event.preventDefault();
    //recover the file from the input
    const inputElem = event.target;
    const file = inputElem.files[0];
    const formData = new FormData();
    formData.append("uploadedFile", file);
    formData.append("eventName", "profilePicture");

    //get the user id
    const uid = getUserIdFromUrl();

    //send the file
    const response = await fetch(`/api/data/speakers/${uid}/profilepicture`, {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    const pictureElem = document.getElementById("profile-picture");
    pictureElem.src = result.newProfilePictureUrl;
  } catch (error) {
    console.log(error);
  }
}

function getUserIdFromUrl() {
  const currentUrl = window.location.href;
  const url = new URL(currentUrl);
  return url.pathname.split("/").pop();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const uid = getUserIdFromUrl();
    const result = await fetch(`/api/speakers/${uid}/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bio: bioInput.value || "",
        socialLink1: socialLink1Input.value || "",
        socialLink2: socialLink2Input.value || "",
        socialLink3: socialLink3Input.value || "",
      }),
    });
    const response = await result.json();
    console.log(response.message);

    // Alert asking user if they want to view their profile page after updating
    if (
      confirm(
        "Your profile has been updated successfully!\nDo you want to go to your speaker profile page?",
      )
    ) {
      window.location.href = `/speakerProfile/${uid}`;
    }
    //If you don't want to redirect, just having this alert could work fine also
    //alert('Your profile has been updated successfully!');
  } catch (error) {
    console.log(error);
    alert("An error occurred while updating your profile.");
  }
});

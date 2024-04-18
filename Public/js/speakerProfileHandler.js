const form = document.getElementById("profile-form");
const bioInput = document.getElementById("bio");
const socialLink1Input = document.getElementById("socialLink1");
const socialLink2Input = document.getElementById("socialLink2");
const socialLink3Input = document.getElementById("socialLink3");
const editPicture = document.getElementById("btn-edit-picture");
const pictureElem = document.getElementById("profile-picture");
const pictureWrapper = document.getElementById("profile-picture-wrapper");
const buttonIcon = document.getElementById("btn-icon");

/** Get a user's uid from the url string */
function getUserIdFromUrl() {
  const currentUrl = window.location.href;
  const url = new URL(currentUrl);
  return url.pathname.split("/").pop();
}

/** Create an input element of type "file" to open a file picker */
function createInputElement() {
  const inputElem = document.createElement("input");
  inputElem.type = "file";
  inputElem.name = "uploadedFile";
  inputElem.id = "uploadedFile";
  return inputElem;
}

/** Clean up the input element when it's done being used */
function destroyInputElement() {
  const inputElem = document.getElementById("uploadedFile");
  inputElem.remove();
}

/**This eventListener creates a file input on click
 * and opens the file picker to prompt the user to select a file
 */
editPicture.addEventListener("click", async (event) => {
  try {
    event.preventDefault();
    //create the input, prompt for file
    const inputElem = createInputElement();

    //hand the image off to this callback when selected
    inputElem.addEventListener("change", handlePictureSelection);
    inputElem.click();
  } catch (error) {
    console.log(error);
  }
});

/** Apply a color and an animation to an element */
function animate(element, background, animation) {
  element.style.animation = animation;
  element.style.background = background;
}

/** Take the file input element, convert it to form data */
function buildFormDataFromFileInput(inputElem) {
  const file = inputElem.files[0];
  const formData = new FormData();
  formData.append("uploadedFile", file);
  formData.append("eventName", "profilePicture");
  return formData;
}

/**This function uploads the file after the user selects it */
async function handlePictureSelection(event) {
  try {
    event.preventDefault();

    //animate a green spinner on the profile picture
    animate(
      pictureWrapper,
      "conic-gradient(from 15deg, transparent, transparent, #03fc17)",
      "1s spinner-rotate infinite",
    );

    //recover the file from the input
    const inputElem = event.target;
    const formData = buildFormDataFromFileInput(inputElem);

    //get the user id
    const uid = getUserIdFromUrl();

    //send the file
    const response = await fetch(`/api/data/speakers/${uid}/profilepicture`, {
      method: "POST",
      body: formData,
    });

    //assign the new picture link to the displayed picture element
    const result = await response.json();
    pictureElem.src = result.newProfilePictureUrl;

    //end the animation, circle green, update the button icon
    animate(pictureWrapper, "#03fc17", "");
    buttonIcon.src = "/images/icon_material_done.svg";

    //wait a few seconds, then black it out
    setTimeout(() => {
      //forwards maintains the ending animation state
      animate(pictureWrapper, "#03fc17", "1s profile-fade-out forwards");
      buttonIcon.src = "/images/icon_pencil.svg";
    }, 1000);
  } catch (error) {
    //if we fail, red circle and error icon
    animate(pictureWrapper, "#FC0303", "");
    buttonIcon.src = "/images/icon_material_error.svg";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const uid = getUserIdFromUrl();
    const result = await fetch(`/api/data/speakers/${uid}/profile`, {
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

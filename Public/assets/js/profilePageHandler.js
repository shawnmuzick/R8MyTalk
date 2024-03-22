const uploadedFile = document.getElementById("uploadedFile");
const fileName = document.getElementById("uploadedFileName");
const uploadButton = document.getElementById("btnSubmitFile");
const fileData = new FormData();
var EVENT_NAME; // we need to grab event name

/**
 * Update the selected event global variable
 */
function UpdateGlobalEventName(event) {
  if (event.target.name === "ellipsisDropdown") {
    EVENT_NAME = event.target.getAttribute("data-event-name");
    console.log("Global Event Name:" + EVENT_NAME);
  }
}

/**
 * Handle a click on the button to download a QR code
 * Request it from the back end, do the link trick to download the image
 * Same pattern as the file download functionality in Feedback.js
 */
async function HandleButtonQR(event) {
  const rowIndex = event.target.getAttribute("data-row-index");
  const eventName = event.target.getAttribute("data-event-name");

  try {
    const response = await fetch("/qrButton", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rowIndex: rowIndex,
        eventName: eventName,
      }),
    });
    const firebaseUrl = await response.text();
    // if we didn't get a url, then there's no qrcode, error
    if (!firebaseUrl.includes("firebasestorage")) {
      throw new Error("No files");
    }
    // Get the file using the url
    const firebaseResponse = await fetch(firebaseUrl, { method: "GET" });
    const blob = await firebaseResponse.blob();
    const file = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = file;
    a.download = eventName + "QR";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    console.log(error);
  }
}

/**
 * Handle a click on the button to delete an event
 */
async function HandleButtonDeleteEvent(event) {
  event.preventDefault();
  const eventName = event.target.getAttribute("data-event-name");
  try {
    const response = await fetch("/deleteEvent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName: eventName,
      }),
    });
    const result = await response.json();
    window.location.reload();
  } catch (error) {
    console.log(error);
  }
}

/**
 * Handle a click on the button to create a custom question
 */
async function HandleButtonSubmitCustomQuestion(event) {
  event.preventDefault();
  const newCustomQ = document.getElementById("newCustomQ").value;
  try {
    const response = await fetch("/editCustomQ", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName: EVENT_NAME,
        customQuestion: newCustomQ,
      }),
    });
    const result = await response.json();
    window.location.reload();
  } catch (error) {
    console.log(error);
  }
}

/**
 * Handle a click on the button to go to the test survey view
 */
async function HandleButtonGoToSurvey(event) {
  const rowIndex = event.target.getAttribute("data-row-index");
  const eventName = event.target.getAttribute("data-event-name");
  try {
    const response = await fetch("/goToSurveyButton", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rowIndex: rowIndex,
        eventName: eventName,
      }),
    });
    const result = await response.text();
    window.location.href = result;
    window.location.reload();
  } catch (error) {
    console.log(error);
  }
}

/**
 * Route to various handlers
 * This is bad, and needs to be revised.
 * There's no reason for this to be on the document object
 */
document.addEventListener("click", async (event) => {
  UpdateGlobalEventName(event);
  if (event.target.name === "qrButton") {
    await HandleButtonQR(event);
  } else if (event.target.name === "deleteEvent") {
    await HandleButtonDeleteEvent(event);
  } else if (event.target.name === "submitCustomQ") {
    await HandleButtonSubmitCustomQuestion(event);
  } else if (event.target.name === "goToSurveyButton") {
    await HandleButtonGoToSurvey(event);
  }
});

/**
 * Handler to review an event page
 * This is bad, and needs to be revised.
 * There's no reason for this to be on the document object
 */
document.addEventListener("click", (event) => {
  if (event.target.name === "eventPage") {
    //redirect to the page with the correct name
    const eventName = event.target.getAttribute("data-event-name");
    window.location.href = `/review/${eventName}`;
  }
});

/**
 * Handler to listen for file input changes
 * This is bad, and needs to be revised.
 * There's no reason for this to be on the document object
 */
document.addEventListener("change", () => {
  if (uploadedFile.files.length > 0) {
    // Display the filename
    fileName.textContent = `Selected file:  ${uploadedFile.files[0].name}`;
    fileData.append("uploadedFile", uploadedFile.files[0]);
    fileData.append("eventName", EVENT_NAME);
  }
});

/**
 * This function updates the icon in the file upload modal
 * @param {string} src - the image source
 * @param {string} visibility - the visibility property
 * @param {string} animation - the animation string
 */
function updateUploadIcon(src, visibility, animation) {
  const icon = document.getElementById("icon_done");
  icon.style.animation = animation;
  icon.src = src;
  icon.style.visibility = visibility;
}

/**
 * This function updates the status text in the file upload modal
 * @param {string} message - the text to display
 */
function updateUploadMessage(message) {
  document.getElementById("upload-result-message").innerText = message;
}

function resetUploadForm() {
  const input = document.getElementById("uploadedFile");
  input.files = null;
  updateUploadIcon("/images/icon_material_done.svg", "hidden", "");
  updateUploadMessage("");
}

/**This function uploads a file to the endpont via the fetch API
 * You must prevent the default form behavior, or 2 requests will
 * be sent to the backend
 * The content type headers should be empty for file uploads
 */
uploadButton.addEventListener("click", async (event) => {
  event.preventDefault(); //Prevent default link behavior
  updateUploadMessage("Please wait while your file uploads...");
  updateUploadIcon(
    "/images/icon_material_progress.svg",
    "visible",
    "1s spinner-rotate infinite",
  );

  try {
    const response = await fetch("/uploadFile", {
      method: "POST",
      //headers: { "Content-Type": "multipart/form-data" },
      body: fileData,
    });
    const result = await response.json();
    updateUploadIcon("/images/icon_material_done.svg", "", "visible");
    updateUploadMessage(result.message + ": You may close this window");
  } catch (error) {
    console.log(error);
    updateUploadIcon("/images/icon_material_error.svg", "", "visible");
    updateUploadMessage(
      error +
        ": Please close this window and try again or contact your Administrator",
    );
  }
});

document
  .getElementById("btnCloseFile")
  .addEventListener("click", async (event) => {
    resetUploadForm();
  });

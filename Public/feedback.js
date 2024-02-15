const questionElement = document.getElementById("questionElement");
const textareaElement = document.querySelector("#message");
const defaultQuestion = "How would you describe this event to a friend?";
let currentQuestionIndex = 0;
let customQuestion;
const questions = [customQuestion, defaultQuestion];

/**
 * Parse a url to get the event uuid and the eventname
 */
function parseURL(url) {
  const pathSections = new URL(url).pathname.split("/");
  return { uid: pathSections[2], eventName: pathSections[3] };
}

/**
 * Event name should load as soon as the HTML page loads
 * Invoke the function when the page loads
 */
function SetEventName() {
  const urlParts = parseURL(window.location.href);
  const eventName = urlParts.eventName;
  document.getElementById("eventName").textContent = eventName.replace(
    /-/g,
    " ",
  );
}
SetEventName();

document.addEventListener("DOMContentLoaded", () => {
  // Access the variableToSend from the data attribute
  customQuestion = questionElement.dataset.variable;
  console.log("Variable received in Feedback.js:", customQuestion);
});

document
  .getElementById("feedbackButton")
  .addEventListener("click", async () => {
    if (currentQuestionIndex < questions.length) {
      const question = questions[currentQuestionIndex]; // Save current question
      const answer = textareaElement.value; // Save current answer
      await sendToBackEnd(question, answer); // Send info

      currentQuestionIndex++;
      if (currentQuestionIndex < questions.length) {
        questionElement.textContent = questions[currentQuestionIndex];
      } else {
        // Load the survey form or perform any other action
        displayChanges();
      }
      textareaElement.value = "";
    }
  });

/**
 * Update the display text of the download button with a status message
 * Disable it from being clicked again
 */
function UpdateDownloadButtonDisplay(buttonText) {
  const btn = document.getElementById("btnDownloadFile");
  btn.innerText = buttonText;
  btn.disabled = true;
}

/**
 * An event listener to download files for the event when the survey has been completed
 * First, get the firebase download url from the backend
 * Then, get the file using the url
 */
document
  .getElementById("btnDownloadFile")
  .addEventListener("click", async () => {
    UpdateDownloadButtonDisplay(
      "Please wait while your file is being downloaded...",
    );
    const urlParts = parseURL(window.location.href);
    try {
      // Get the firbase url from the backend
      const response = await fetch("/downloadFile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: urlParts.uid,
          eventName: urlParts.eventName,
        }),
      });
      const firebaseUrl = await response.text();
      // if we didn't get a url, then there's no files, error and update display
      if (!firebaseUrl.includes("firebasestorage")) {
        throw new Error("No files");
      }

      // Get the file using the url
      const firebaseResponse = await fetch(firebaseUrl, { method: "GET" });
      const blob = await firebaseResponse.blob();
      const file = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = file;
      a.download = eventName + " Presentation";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      UpdateDownloadButtonDisplay("Download Complete!");
    } catch (error) {
      console.log(error);
      UpdateDownloadButtonDisplay(
        "The Presenter has not uploaded any files to share.",
      );
    }
  });

async function sendToBackEnd(question, answer) {
  const urlParts = parseURL(window.location.href);
  try {
    const response = await fetch("/feedbackSelection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        feedbackQuestion: question,
        feedbackAnswer: answer,
        uid: urlParts.uid,
        eventName: urlParts.eventName,
      }),
    });
    const json = await response.json();
    console.log("Success:", json.message);
  } catch (error) {
    console.error("Error:", error);
  }
}

/**
 * This function is called from the ejs template directly,
 * not through a handler added by this javascript file
 */
document
  .getElementById("contact-submit-btn")
  .addEventListener("click", async () => {
    const urlParts = parseURL(window.location.href);
    const fullName = document.getElementById("fullName").value;
    const phoneNumber = document.getElementById("phoneNumber").value;
    const email = document.getElementById("email").value;
    const role = document.getElementById("role").value;
    try {
      const response = await fetch("/contactForm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName,
          phoneNumber: phoneNumber,
          email: email,
          role: role,
          uid: urlParts.uid,
          eventName: urlParts.eventName,
        }),
      });
      const json = await response.json();
      console.log("Success:", json.message);
      displayThankYou();
    } catch (error) {
      console.log(error);
    }
  });

/**
 * Hide the feedback section and show the contact section
 */
function displayChanges() {
  document.getElementById("feedbackSection").style.display = "none";
  document.getElementById("question-container").style.display = "none";
  document.getElementById("survey-ending").style.display = "none";
  document.getElementById("contact-section").style.display = "block";
}

function displayThankYou() {
  document.getElementById("contact-section").style.display = "none";
  document.getElementById("thankYou-section").style.display = "block";
}

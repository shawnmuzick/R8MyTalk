//want to send back the eventName
const uploadedFile = document.getElementById("uploadedFile");
const fileName = document.getElementById("uploadedFileName");
const uploadButton = document.getElementById("btnSubmitFile");
const fileData = new FormData();
var eventNameGlobal; // we need to grab event name

document.addEventListener("click", (event) => {
  if (event.target.name === "ellipsisDropdown") {
    eventNameGlobal = event.target.getAttribute("data-event-name");
    console.log("Global Event Name:" + eventNameGlobal);
  }

  if (event.target.name === "qrButton") {
    const rowIndex = event.target.getAttribute("data-row-index");
    const eventName = event.target.getAttribute("data-event-name");

    // Create an AJAX request to send the eventName to the backend
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/qrButton", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    // Define the data to send
    const data = {
      rowIndex: rowIndex,
      eventName: eventName,
    };

    xhr.send(JSON.stringify(data));

    // Handle the response from the backend if needed
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        //response from the backend here
        console.log("Response from backend: " + xhr.responseText); //xhr.responsetext is the url
        //window.open(xhr.responseText, '_blank'); //what was opening it in a different tab
        const xhr2 = new XMLHttpRequest();
        xhr2.responseType = "blob";
        xhr2.onload = (event) => {
          //test
          const blob = xhr2.response;
          //console.log(blob);
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob); //
          a.download = eventName + "QR";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        };

        xhr2.open("GET", xhr.responseText);
        xhr2.send();
      } else {
        console.error();
      }
    };
  } else if (event.target.name === "deleteEvent") {
    const eventName = event.target.getAttribute("data-event-name");

    // Create an AJAX request to send the eventName to the backend
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/deleteEvent", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    console.log(eventName);
    // Define the data to send
    const data = {
      eventName: eventName,
    };

    xhr.send(JSON.stringify(data));
    window.location.reload();

    //new for create edit custom question
  } else if (event.target.name === "submitCustomQ") {
    const newCustomQ = document.getElementById("newCustomQ").value;
    console.log("IN AJAX: " + newCustomQ);

    // Create an AJAX request to send the eventName to the backend
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/editCustomQ", true); //might not need slash
    xhr.setRequestHeader("Content-Type", "application/json");
    console.log(eventNameGlobal);
    // Define the data to send
    const data = {
      eventName: eventNameGlobal,
      customQuestion: newCustomQ,
    };

    event.preventDefault(); //prevents it being called twice for some reason

    xhr.send(JSON.stringify(data));
    window.location.reload();
  } else if (event.target.name === "goToSurveyButton") {
    const rowIndex = event.target.getAttribute("data-row-index");
    const eventName = event.target.getAttribute("data-event-name");

    // Create an AJAX request to send the eventName to the backend
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/goToSurveyButton", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    // Define the data to send
    const data = {
      rowIndex: rowIndex,
      eventName: eventName,
    };

    xhr.send(JSON.stringify(data));

    //response from the backend if needed
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        console.log("Response from backend: " + xhr.responseURL);
        window.location.href = xhr.responseURL;
      }
    };
  }
});

//clicked an event
document.addEventListener("click", (event) => {
  if (event.target.name === "eventPage") {
    //redirect to the page with the correct name
    const eventName = event.target.getAttribute("data-event-name");
    const reviewURL = `/review/${eventName}`;
    window.location.href = reviewURL;
  }
});

//uploading File
document.addEventListener("change", () => {
  if (uploadedFile.files.length > 0) {
    // Display the filename
    fileName.textContent = `Selected file:  ${uploadedFile.files[0].name}`;
    fileData.append("uploadedFile", uploadedFile.files[0]);
    fileData.append("eventName", eventNameGlobal);
  }
});

/**This function uploads a file to the endpont via the fetch API
 * You must prevent the default form behavior, or 2 requests will
 * be sent to the backend
 * The content type headers should be empty for file uploads
 */
uploadButton.addEventListener("click", uploadClickHandler);
async function uploadClickHandler(event) {
  event.preventDefault(); //Prevent default link behavior
  try {
    const response = await fetch("/uploadFile", {
      method: "POST",
      //headers: { "Content-Type": "multipart/form-data" },
      body: fileData,
    });
    //present the user with a status message
    const result = await response.json();
    document.getElementById("upload-result-message").innerText =
      result.message + ": You may close this window";
  } catch (error) {
    console.log(error);
    document.getElementById("upload-result-message").innerText =
      error + ": You may close this window";
  }
}

function handleNavbarLinkClick(event) {
  //COMEBACK
  const currentURL = window.location.pathname;

  //if the current URL contains '/review/'
  if (currentURL.includes("/review/")) {
    //remove it from the URL before redirection
    const modifiedURL = currentURL.replace("/review/", "/");
    window.location.href = event.target.href + modifiedURL; // Redirect to modified URL
  } else {
    //redirect normally
    window.location.href = event.target.href;
  }

  event.preventDefault(); //Prevent default link behavior
}

//event listener to the navbar link COMEBACK
//navigator.addEventListener('click', handleNavbarLinkClick);

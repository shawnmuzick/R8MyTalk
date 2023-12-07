let currentEmojiIndex = 0;
let selectedEmoji = null; // set a default
// Didn't include Actionable because that is the default
let emojiQuestions = ["Actionable?", "Engaging?", "Interactive?", "Inspiring?", "Relevant?"];
const curURL = window.location.href;
const eventName = parseURL(curURL).eventName;

console.log(eventName);

// Event name should load as soon as the HTML page loads
document.getElementById('eventName').textContent =  eventName.replace(/-/g, ' ');


// Update the current emoji question
// questionElement.innerHTML = emojiQuestions[currentEmojiIndex];

// When an emoji is clicked on we will grab the current selection
function setSelection(selection) {

     // Prevent the page from jumping to the top of the screen
     event.preventDefault();
    
    selectedEmoji = selection.getAttribute("data-emoji");

    toggleSelection(selection);
    console.log(selectedEmoji);

}

function changeQuestion() {
    if (selectedEmoji != null) {
        let questionElement = document.getElementById("question");
        let emojis = document.querySelectorAll(".emoji");

        // Send the selected emoji for the current question
        sendEmojiData(selectedEmoji);

        removeSelection();

        if (currentEmojiIndex < emojiQuestions.length - 1) {
            // Move to the next emoji question
            currentEmojiIndex++;

            // Update the current emoji question
            questionElement.innerHTML = emojiQuestions[currentEmojiIndex];

            // Reset the current emoji 
            selectedEmoji = null;
            const curURL = window.location.href;
            console.log(curURL);

        } else {
            // Last question reached, load the form portion
            //const {uid, eventName} = req.params;
            const urlParts = parseURL(window.location.href);

            window.location.href = '/feedback/' + urlParts.uid + "/" + urlParts.eventName;
        }
    } else {
        alert("Please make a selection");
    }
}

function parseURL(url) {
    const path = new URL(url);
    const pathName = path.pathname;

    const pathSections = pathName.split('/');
    const uid = pathSections[2];
    const eventName = pathSections[3];
    
    //replace(/-/g, ' ');
    const data = {
        uid: uid,
        eventName: eventName
    }
    return data;

}

function sendEmojiData(selectedEmoji) {

    let question;

    question = document.getElementById("question").textContent;
    const curURL = window.location.href;
    const urlParts = parseURL(curURL);

    // Perform a POST request to send the selected emoji data
    // You can use fetch or any other method to send data to your desired endpoint
    fetch('/emojiSelection', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sendQuestion: emojiQuestions[currentEmojiIndex],
                emoji: selectedEmoji,
                uid: urlParts.uid,
                eventName: urlParts.eventName

            }),
        })
        .then(response => response.json()) // Convert the response into JSON format 
        .then(data => { // Access the converted JSON data 
            console.log('Success:', data);

        })
        .catch((error) => {
            console.error('Error:', error);
            // Handle errors if needed
        });

}

function toggleSelection(clickedImage) {
    var allImages = document.getElementsByClassName("emoji");

    for (var i = 0; i < allImages.length; i++) {
        allImages[i].classList.remove("selected");
    }

    clickedImage.classList.toggle("selected");
}


function removeSelection() {
    var allImages = document.getElementsByClassName("emoji");

    for (var i = 0; i < allImages.length; i++) {
        allImages[i].classList.remove("selected");
    }
}
const form = document.getElementById("profile-form");
const bioInput = document.getElementById("bio");
const socialLink1Input = document.getElementById("socialLink1");
const socialLink2Input = document.getElementById("socialLink2");
const socialLink3Input = document.getElementById("socialLink3");

document.addEventListener("DOMContentLoaded", () => {
  const currentUrl = window.location.href;
  const url = new URL(currentUrl);
  const uid = url.pathname.split("/").pop();
  const updateUrl = `/speakerProfile/${uid}/update`;

  // Add event listener for form submission
  form.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent default form submission

    // Create a FormData object and append the form data
    const formData = new FormData();
    formData.append("bio", bioInput.value || "");
    formData.append("socialLink1", socialLink1Input.value || "");
    formData.append("socialLink2", socialLink2Input.value || "");
    formData.append("socialLink3", socialLink3Input.value || "");

    // Send the form data to the server
    fetch(updateUrl, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          // Redirects to the updated profile page
          window.location.href = `/speakerProfile/${uid}`;
        } else {
          console.error("Failed to update profile");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
});

const form = document.getElementById("profile-form");
const bioInput = document.getElementById("bio");
const socialLink1Input = document.getElementById("socialLink1");
const socialLink2Input = document.getElementById("socialLink2");
const socialLink3Input = document.getElementById("socialLink3");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const currentUrl = window.location.href;
    const url = new URL(currentUrl);
    const uid = url.pathname.split("/").pop();

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

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
  } catch (error) {
    console.log(error);
  }
});

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const searchQuery = searchInput.value.trim();
  if (searchQuery) {
    try {
      const response = await fetch(
        `/api/data/speakers/search?q=${searchQuery}`,
      );
      const { data } = await response.json();
      // Clear previous search results
      searchResults.innerHTML = "";
      if (data.length > 0) {
        // Create bootstrap cards for each user that matches search query
        data.forEach((user) => {
          const userCard = document.createElement("div");
          userCard.className = "card mb-3 mx-auto";
          userCard.style.maxWidth = "540px";
          userCard.style.cursor = "pointer";

          const row = document.createElement("div");
          row.className = "row g-0";
          const imageColumn = document.createElement("div");
          imageColumn.className =
            "col-md-4 d-flex justify-content-center align-items-center";
          imageColumn.style.height = "100%";
          const profilePicture = document.createElement("img");
          profilePicture.className = "img-fluid rounded-start";
          profilePicture.src = "images/placeHolderProfilePicture.png"; // Placeholder image
          profilePicture.alt = "Profile Picture";
          imageColumn.appendChild(profilePicture);
          row.appendChild(imageColumn);

          const bodyColumn = document.createElement("div");
          bodyColumn.className =
            "col-md-8 justify-content-center align-items-center";
          const cardBody = document.createElement("div");
          cardBody.className = "card-body";

          const displayNameElement = document.createElement("h5");
          displayNameElement.className = "card-title h1";
          displayNameElement.textContent = user?.displayName;
          cardBody.appendChild(displayNameElement);
          const fullNameElement = document.createElement("p");
          fullNameElement.className = "card-text lead";
          fullNameElement.textContent =
            user?.profile.firstName + " " + user?.profile.lastName;
          cardBody.appendChild(fullNameElement);

          // Event listener redirects to profile page when card is clicked
          userCard.addEventListener("click", () => {
            window.location.href = `/speakerProfile/${user.uid}`;
          });
          bodyColumn.appendChild(cardBody);
          row.appendChild(bodyColumn);
          userCard.appendChild(row);
          searchResults.appendChild(userCard);
        });
      } else {
        // Display a message if no users match the search query
        const noResultsMessage = document.createElement("p");
        noResultsMessage.textContent = "No users found.";
        noResultsMessage.className = "lead";
        searchResults.appendChild(noResultsMessage);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    }
  }
});

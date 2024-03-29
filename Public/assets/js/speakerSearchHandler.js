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
        // Display the matching users
        data.forEach((user) => {
          const userElement = document.createElement("a");
          userElement.href = `/speakerProfile/${user.uid}`;
          userElement.className = "display-3";
          userElement.textContent = user.displayName;
          searchResults.appendChild(userElement);
          searchResults.appendChild(document.createElement("br"));
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

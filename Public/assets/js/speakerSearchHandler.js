const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

/** Check if the user record has a valid image src string */
function checkForValidProfileImage(user) {
  return user?.profile?.profilePictureUrl === ""
    ? "images/placeHolderProfilePicture.png"
    : user?.profile?.profilePictureUrl;
}

/** Clear the search results list */
function clearSearchResults() {
  searchResults.innerHTML = "";
}

/** Display a message to the user if no results found */
function handleNoResults() {
  const noResultsMessage = buildElement("p", "lead");
  noResultsMessage.textContent = "No users found.";
  searchResults.appendChild(noResultsMessage);
}

/** Display a message to the user if error*/
function handleSearchError(error) {
  const err = buildElement("p", "lead");
  err.textContent = `Error searching: ${error}`;
  searchResults.appendChild(err);
}

/** Get the template element representing the card,
 *  clone it, and populate the data
 */
function getHtmlTemplate(user) {
  const image = checkForValidProfileImage(user);
  const template = document.getElementsByTagName("template")[0];
  const card = template.content.cloneNode(true);
  card.querySelector("h5").textContent =
    `${user?.profile.firstName} ${user?.profile.lastName}`;
  card.querySelector("p").textContent = user?.displayName;
  card.querySelector("img").src = image;
  return card;
}

searchForm.addEventListener("submit", async (event) => {
  try {
    event.preventDefault();
    const searchQuery = searchInput.value.trim();
    //if we didn't get a search query, bail early
    if (!searchQuery) {
      return;
    }
    const response = await fetch(`/api/data/speakers/search?q=${searchQuery}`);
    const { data } = await response.json();
    clearSearchResults();
    //if we didn't get any data, display a message and bail
    if (!(data.length > 0)) {
      handleNoResults();
      return;
    }

    //otherwise, build the user profile cards
    data.forEach((user) => {
      const userCard = getHtmlTemplate(user);

      // Event listener redirects to profile page when card is clicked
      userCard.addEventListener("click", () => {
        window.location.href = `/speakerProfile/${user.uid}`;
      });
      searchResults.appendChild(userCard);
    });
  } catch (error) {
    handleSearchError(error);
  }
});

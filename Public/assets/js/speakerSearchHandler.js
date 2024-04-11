const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

/** Check if the user record has a valid image src string */
function checkForValidProfileImage(user) {
  return user?.profile?.profilePictureUrl == ""
    ? "images/placeHolderProfilePicture.png"
    : user?.profile?.profilePictureUrl;
}

/** Build a Bootstrap card element for the user record */
function buildUserCardElement() {
  const userCard = document.createElement("div");
  userCard.className = "card mb-3 mx-auto";
  userCard.style.maxWidth = "540px";
  userCard.style.cursor = "pointer";
  return userCard;
}

/** Build a row element for a user card */
function buildRowElement() {
  const row = document.createElement("div");
  row.className = "row g-0";
  return row;
}

/** Build a column element for a user card */
function buildColumnElement() {
  const imageColumn = document.createElement("div");
  imageColumn.className =
    "col-md-4 d-flex justify-content-center align-items-center";
  imageColumn.style.height = "100%";
  return imageColumn;
}

/** Build an image element for a user card */
function buildPictureElement(imageSrc) {
  const profilePicture = document.createElement("img");
  profilePicture.className = "img-fluid rounded-start";
  profilePicture.src = imageSrc;
  profilePicture.alt = "Profile Picture";
  return profilePicture;
}

/** Clear the search results list */
function clearSearchResults() {
  searchResults.innerHTML = "";
}

/** Display a message to the user if no results found */
function handleNoResults() {
  const noResultsMessage = document.createElement("p");
  noResultsMessage.textContent = "No users found.";
  noResultsMessage.className = "lead";
  searchResults.appendChild(noResultsMessage);
}

/** Display a message to the user if error*/
function handleSearchError(error) {
  const err = document.createElement("p");
  err.textContent = `Error searching: ${error}`;
  err.className = "lead";
  searchResults.appendChild(err);
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
      const image = checkForValidProfileImage(user);
      const userCard = buildUserCardElement();
      const row = buildRowElement();
      const imageColumn = buildColumnElement();
      const profilePicture = buildPictureElement(image);
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
  } catch (error) {
    handleSearchError(error);
  }
});

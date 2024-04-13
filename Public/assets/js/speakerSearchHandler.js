const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

/** A function to build DOM elements */
function buildElement(type, className) {
  const e = document.createElement(type);
  e.className = className;
  return e;
}

/** Check if the user record has a valid image src string */
function checkForValidProfileImage(user) {
  return user?.profile?.profilePictureUrl === ""
    ? "images/placeHolderProfilePicture.png"
    : user?.profile?.profilePictureUrl;
}

/** Build a Bootstrap card element for the user record */
function UserCard() {
  const userCard = buildElement("div", "card mb-3 mx-auto");
  userCard.style.maxWidth = "540px";
  userCard.style.cursor = "pointer";
  return userCard;
}

/** Build a column element for a user card */
function ImageColumn() {
  const imageColumn = buildElement(
    "div",
    "col-md-4 d-flex justify-content-center align-items-center",
  );
  imageColumn.style.height = "100%";
  return imageColumn;
}

/** Build an image element for a user card */
function ProfilePicture(imageSrc) {
  const profilePicture = buildElement("img", "img-fluid rounded-start");
  profilePicture.src = imageSrc;
  profilePicture.alt = "Profile Picture";
  return profilePicture;
}

/** Clear the search results list */
function clearSearchResults() {
  searchResults.innerHTML = "";
}

/** Function to return a display name header */
function DisplayName(user) {
  const e = buildElement("h5", "card-title h1");
  e.textContent = user?.displayName;
  return e;
}

/** Function to return a full name label */
function FullName(user) {
  const e = buildElement("p", "card-text lead");
  e.textContent = `${user?.profile.firstName} ${user?.profile.lastName}`;
  return e;
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
      const userCard = UserCard();
      const row = buildElement("div", "row g-0");
      const imageColumn = ImageColumn();
      imageColumn.appendChild(ProfilePicture(image));
      row.appendChild(imageColumn);

      const bodyColumn = buildElement(
        "div",
        "col-md-8 justify-content-center align-items-center",
      );
      const cardBody = buildElement("div", "card-body");

      cardBody.appendChild(DisplayName(user));
      cardBody.appendChild(FullName(user));

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

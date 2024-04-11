export class Speaker {
  constructor(data) {
    this.uid = data?.uid;
    this.displayName = data?.displayName;
  }
  populateProfile(data) {
    this.firstName = data?.firstName ?? "";
    this.lastName = data?.lastName ?? "";
    this.bio = data?.Bio ?? "";
    this.socialLink1 = data?.socialLink1 ?? "";
    this.socialLink2 = data?.socialLink2 ?? "";
    this.socialLink3 = data?.socialLink3 ?? "";
    this.profilePictureUrl = data?.profilePictureUrl ?? "";
  }
}

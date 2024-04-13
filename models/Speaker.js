export class Speaker {
  constructor(data) {
    this.uid = data?.uid;
    this.displayName = data?.displayName;
    this.profile = {};
  }
  populateProfile(data) {
    this.profile.firstName = data?.firstName ?? "";
    this.profile.lastName = data?.lastName ?? "";
    this.profile.bio = data?.Bio ?? "";
    this.profile.socialLink1 = data?.socialLink1 ?? "";
    this.profile.socialLink2 = data?.socialLink2 ?? "";
    this.profile.socialLink3 = data?.socialLink3 ?? "";
    this.profile.profilePictureUrl = data?.profilePictureUrl ?? "";
  }
}

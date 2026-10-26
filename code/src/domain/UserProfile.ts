export interface UserProfileData {
  uid: string;
  login: string;
  firstName: string;
  lastName: string;
  createdAt: number;
}

export class UserProfile {
  readonly uid: string;
  readonly login: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly createdAt: number;

  private constructor(data: UserProfileData) {
    this.uid = data.uid;
    this.login = data.login;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.createdAt = data.createdAt;
  }

  static normalizeLogin(login: string): string {
    return login.trim().toLowerCase();
  }

  static create(uid: string, login: string, firstName: string, lastName: string, now: number): UserProfile {
    return new UserProfile({
      uid,
      login: UserProfile.normalizeLogin(login),
      firstName,
      lastName,
      createdAt: now,
    });
  }

  static fromData(data: UserProfileData): UserProfile {
    return new UserProfile(data);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  toData(): UserProfileData {
    return {
      uid: this.uid,
      login: this.login,
      firstName: this.firstName,
      lastName: this.lastName,
      createdAt: this.createdAt,
    };
  }
}

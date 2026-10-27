export interface UserProfileData {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: number;
}

export class UserProfile {
  readonly uid: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly createdAt: number;

  private constructor(data: UserProfileData) {
    this.uid = data.uid;
    this.email = data.email;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.createdAt = data.createdAt;
  }

  static create(uid: string, email: string, firstName: string, lastName: string, now: number): UserProfile {
    return new UserProfile({ uid, email, firstName, lastName, createdAt: now });
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
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      createdAt: this.createdAt,
    };
  }
}

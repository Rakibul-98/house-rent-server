import { Model } from "mongoose";

// User interface
export interface TUser {
  user_name: string;
  email: string;
  password: string;
  role: "customer" | "admin";
  profile_image: string;
  isBlocked: boolean;
  isDeleted: boolean;
}

// User interface for statics
export interface User extends Model<TUser> {
  isUserExistsByEmail(email: string): Promise<TUser>;
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string
  ): Promise<boolean>;
  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number
  ): boolean;
}

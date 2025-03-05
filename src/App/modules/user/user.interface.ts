import { Model } from "mongoose";

// User interface
export interface TUser {
  user_name: string;
  email: string;
  phone_num: string;
  password: string;
  role: "tenant" | "admin" | "owner";
  profile_image: string;
  isBlocked: boolean;
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

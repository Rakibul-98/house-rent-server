import { model, Schema } from "mongoose";
import { TUser, User } from "./user.interface";
import bcrypt from "bcrypt";
import config from "../../config";

// user schema with user interface
const userSchema = new Schema<TUser, User>(
  {
    user_name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    phone_num: {
      type: String,
      required: [true, "Phone number is required"],
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    profile_image: {
      type: String,
      default: "https://i.ibb.co.com/jkpLFGBq/dummy-user.png",
    },
    role: {
      type: String,
      enum: ["tenant", "admin", "owner"],
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },

  },
  {
    timestamps: true,
  }
);

// password hashing with bcrypt
userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds)
  );
  next();
});

// hide password field in response
userSchema.pre("find", async function (next) {
  this.select("-password");
  next();
});

userSchema.post("save", function (doc, next) {
  doc.password = "";
  next();
});

// static method to check if user exists by email
userSchema.statics.isUserExistsByEmail = async function (email: string) {
  return await this.findOne({ email }).select("+password");
};

// static method to check if password matches with hashed password
userSchema.statics.isPasswordMatched = async function (
  plainTextPassword: string,
  hashedPassword: string
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

userSchema.statics.isJWTIssuedBeforePasswordChanged = function (
  passwordChangedTimestamp: Date,
  jwtIssuedTimestamp: number
) {
  const passwordChangedTime =
    new Date(passwordChangedTimestamp).getTime() / 1000;
  return passwordChangedTime > jwtIssuedTimestamp;
};

export const UserModel = model<TUser, User>("User", userSchema);

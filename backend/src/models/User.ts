import { HydratedDocument, InferSchemaType, Model, Schema, model, models } from "mongoose";

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    studentId: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    university: {
      type: String,
      required: true,
      trim: true,
    },
    trustScore: {
      type: Number,
      required: true,
      default: 0,
    },
    avatarUrl: {
      type: String,
      required: false,
      trim: true,
    },
    bio: {
      type: String,
      required: false,
      trim: true,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  },
);

export type User = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<User>;
type UserModel = Model<User>;

export const UserModel = (models.User as UserModel | undefined) ?? model<User>("User", userSchema);

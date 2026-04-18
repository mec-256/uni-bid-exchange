import { HydratedDocument, InferSchemaType, Model, Schema, Types, model, models } from "mongoose";

const reviewSchema = new Schema(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    text: {
      type: String,
      required: true,
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

export type Review = Omit<InferSchemaType<typeof reviewSchema>, "sellerId" | "reviewerId"> & {
  sellerId: Types.ObjectId;
  reviewerId: Types.ObjectId;
};
export type ReviewDocument = HydratedDocument<Review>;
type ReviewModel = Model<Review>;

export const ReviewModel =
  (models.Review as ReviewModel | undefined) ?? model<Review>("Review", reviewSchema);

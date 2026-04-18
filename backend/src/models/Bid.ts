import { HydratedDocument, InferSchemaType, Model, Schema, Types, model, models } from "mongoose";

const bidSchema = new Schema(
  {
    auctionId: {
      type: Schema.Types.ObjectId,
      ref: "Auction",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
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

bidSchema.index({ auctionId: 1, createdAt: -1 });

export type Bid = Omit<InferSchemaType<typeof bidSchema>, "auctionId" | "userId"> & {
  auctionId: Types.ObjectId;
  userId: Types.ObjectId;
};
export type BidDocument = HydratedDocument<Bid>;
type BidModel = Model<Bid>;

export const BidModel = (models.Bid as BidModel | undefined) ?? model<Bid>("Bid", bidSchema);

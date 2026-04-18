import { HydratedDocument, InferSchemaType, Model, Schema, Types, model, models } from "mongoose";

const walletSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    held: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalDeposited: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalSpent: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    versionKey: false,
  },
);

export type Wallet = Omit<InferSchemaType<typeof walletSchema>, "userId"> & {
  userId: Types.ObjectId;
};
export type WalletDocument = HydratedDocument<Wallet>;
type WalletModel = Model<Wallet>;

export const WalletModel =
  (models.Wallet as WalletModel | undefined) ?? model<Wallet>("Wallet", walletSchema);

import { model, Schema, Types } from 'mongoose';

export interface AuctionRegistrationDocument {
  _id: Types.ObjectId;
  auctionId: Types.ObjectId;
  userId: Types.ObjectId;
  playerId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const auctionRegistrationSchema = new Schema<AuctionRegistrationDocument>(
  {
    auctionId: { type: Schema.Types.ObjectId, ref: 'Auction', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    playerId: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
  },
  { timestamps: true }
);

export const AuctionRegistrationModel = model<AuctionRegistrationDocument>('AuctionRegistration', auctionRegistrationSchema);

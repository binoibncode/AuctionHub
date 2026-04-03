import { model, Schema, Types } from 'mongoose';

export interface BidDocument {
  _id: Types.ObjectId;
  auctionId: Types.ObjectId;
  playerId: Types.ObjectId;
  teamId: Types.ObjectId;
  userId: Types.ObjectId;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

const bidSchema = new Schema<BidDocument>(
  {
    auctionId: { type: Schema.Types.ObjectId, ref: 'Auction', required: true, index: true },
    playerId: { type: Schema.Types.ObjectId, ref: 'Player', required: true, index: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

export const BidModel = model<BidDocument>('Bid', bidSchema);

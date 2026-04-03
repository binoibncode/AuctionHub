import { model, Schema, Types } from 'mongoose';

export type AuctionStatus = 'upcoming' | 'live' | 'closed';

export interface AuctionDocument {
  _id: Types.ObjectId;
  organizerId: Types.ObjectId;
  categoryId: string;
  name: string;
  auctionCode: string;
  date: string;
  time: string;
  venue: string;
  playersPerTeam: number;
  pointsPerTeam: number;
  minimumBid: number;
  bidIncreaseBy: number;
  totalTeams: number;
  status: AuctionStatus;
  logoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const auctionSchema = new Schema<AuctionDocument>(
  {
    organizerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    categoryId: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    auctionCode: { type: String, required: true, unique: true, index: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    venue: { type: String, required: true },
    playersPerTeam: { type: Number, required: true },
    pointsPerTeam: { type: Number, required: true },
    minimumBid: { type: Number, required: true },
    bidIncreaseBy: { type: Number, required: true },
    totalTeams: { type: Number, required: true },
    status: { type: String, enum: ['upcoming', 'live', 'closed'], default: 'upcoming' },
    logoUrl: { type: String },
  },
  { timestamps: true }
);

export const AuctionModel = model<AuctionDocument>('Auction', auctionSchema);

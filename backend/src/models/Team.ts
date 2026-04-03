import { model, Schema, Types } from 'mongoose';

export interface TeamDocument {
  _id: Types.ObjectId;
  auctionId: Types.ObjectId;
  name: string;
  ownerName: string;
  isOwnerPlaying: boolean;
  ownerPlayerId?: Types.ObjectId;
  iconPlayerId?: Types.ObjectId;
  pointsSpent: number;
  players: Types.ObjectId[];
  logoUrl?: string;
  place?: string;
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema<TeamDocument>(
  {
    auctionId: { type: Schema.Types.ObjectId, ref: 'Auction', required: true, index: true },
    name: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    isOwnerPlaying: { type: Boolean, default: false },
    ownerPlayerId: { type: Schema.Types.ObjectId, ref: 'Player' },
    iconPlayerId: { type: Schema.Types.ObjectId, ref: 'Player' },
    pointsSpent: { type: Number, default: 0 },
    players: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
    logoUrl: { type: String },
    place: { type: String },
  },
  { timestamps: true }
);

export const TeamModel = model<TeamDocument>('Team', teamSchema);

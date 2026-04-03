import { model, Schema, Types } from 'mongoose';

export type PlayerStatus = 'unsold' | 'sold' | 'available' | 'retained';

export interface PlayerDocument {
  _id: Types.ObjectId;
  auctionId: Types.ObjectId;
  name: string;
  sport: string;
  role: string;
  basePrice: number;
  soldPrice?: number;
  soldToTeamId?: Types.ObjectId;
  isIcon: boolean;
  isOwner: boolean;
  category?: string;
  age?: number;
  fatherName?: string;
  playerTag?: string;
  specification?: string;
  skill?: string;
  jerseySize?: string;
  jerseyName?: string;
  jerseyNumber?: string;
  trouserSize?: string;
  extraDetails?: string;
  careerDetails?: Record<string, { debut?: string; lastMatch?: string }>;
  photoUrl?: string;
  secondReferenceUrl?: string;
  userId?: Types.ObjectId;
  status: PlayerStatus;
  createdAt: Date;
  updatedAt: Date;
}

const playerSchema = new Schema<PlayerDocument>(
  {
    auctionId: { type: Schema.Types.ObjectId, ref: 'Auction', required: true, index: true },
    name: { type: String, required: true, trim: true },
    sport: { type: String, required: true },
    role: { type: String, required: true },
    basePrice: { type: Number, required: true },
    soldPrice: { type: Number },
    soldToTeamId: { type: Schema.Types.ObjectId, ref: 'Team' },
    isIcon: { type: Boolean, default: false },
    isOwner: { type: Boolean, default: false },
    category: { type: String },
    age: { type: Number },
    fatherName: { type: String },
    playerTag: { type: String },
    specification: { type: String },
    skill: { type: String },
    jerseySize: { type: String },
    jerseyName: { type: String },
    jerseyNumber: { type: String },
    trouserSize: { type: String },
    extraDetails: { type: String },
    careerDetails: { type: Schema.Types.Mixed },
    photoUrl: { type: String },
    secondReferenceUrl: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['unsold', 'sold', 'available', 'retained'],
      default: 'available',
    },
  },
  { timestamps: true }
);

export const PlayerModel = model<PlayerDocument>('Player', playerSchema);

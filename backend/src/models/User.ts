import { model, Schema, Types } from 'mongoose';

export type Role = 'Admin' | 'Organizer' | 'Bidder' | 'Player';

export interface UserDocument {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
  photoUrl?: string;
  role: Role;
  purse?: number;
  isIcon?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String },
    city: { type: String },
    photoUrl: { type: String },
    role: { type: String, enum: ['Admin', 'Organizer', 'Bidder', 'Player'], required: true },
    purse: { type: Number },
    isIcon: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const UserModel = model<UserDocument>('User', userSchema);

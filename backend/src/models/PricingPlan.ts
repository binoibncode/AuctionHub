import { model, Schema, Types } from 'mongoose';

export interface PricingPlanDocument {
  _id: Types.ObjectId;
  name: string;
  price: number;
  teams: number;
  features: string[];
  recommended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const pricingPlanSchema = new Schema<PricingPlanDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    price: { type: Number, required: true },
    teams: { type: Number, required: true },
    features: [{ type: String }],
    recommended: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const PricingPlanModel = model<PricingPlanDocument>('PricingPlan', pricingPlanSchema);

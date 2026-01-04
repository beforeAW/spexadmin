import mongoose, { Document, Schema } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  description?: string;
  members: mongoose.Types.ObjectId[];
  managers: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const groupSchema = new Schema<IGroup>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    managers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Group = mongoose.model<IGroup>('Group', groupSchema);

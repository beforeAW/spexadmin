import mongoose, { Document, Schema } from 'mongoose';

export interface IRSVP {
  user: mongoose.Types.ObjectId;
  status: 'yes' | 'no';
  respondedAt: Date;
}

export interface IEvent extends Document {
  name: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  rsvpDeadline?: Date;
  allowedGroups: string[];
  allowedUserStatus: ('active' | 'inactive')[];
  forceRSVP: boolean;
  rsvps: IRSVP[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    location: {
      type: String,
      trim: true,
    },
    rsvpDeadline: {
      type: Date,
    },
    allowedGroups: {
      type: [String],
      default: [],
    },
    allowedUserStatus: {
      type: [String],
      enum: ['active', 'inactive'],
      default: ['active'],
    },
    forceRSVP: {
      type: Boolean,
      default: false,
    },
    rsvps: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        status: {
          type: String,
          enum: ['yes', 'no'],
          required: true,
        },
        respondedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Event = mongoose.model<IEvent>('Event', eventSchema);

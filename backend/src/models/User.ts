import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  email: string;
  password: string;
  personnummer?: string;
  firstname: string;
  nickname?: string;
  lastname: string;
  foodpreference?: string;
  allergys?: string[];
  roles: string[];
  groups: string[];
  active: boolean;
  canViewAllDietaryInfo: boolean;
  driversLicense: boolean;
  truckLicense: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    personnummer: {
      type: String,
      trim: true,
    },
    firstname: {
      type: String,
      required: true,
      trim: true,
    },
    nickname: {
      type: String,
      trim: true,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
    },
    foodpreference: {
      type: String,
      trim: true,
    },
    allergys: {
      type: [String],
      default: [],
    },
    roles: {
      type: [String],
      required: true,
      default: ['user'],
    },
    groups: {
      type: [String],
      default: [],
    },
    active: {
      type: Boolean,
      default: true,
    },
    canViewAllDietaryInfo: {
      type: Boolean,
      default: false,
    },
    driversLicense: {
      type: Boolean,
      default: false,
    },
    truckLicense: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);

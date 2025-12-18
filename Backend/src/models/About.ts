import mongoose from 'mongoose';

export interface IAbout extends mongoose.Document {
  shopDescription: string;
  shopMission?: string;
  ownerInfo?: string;
  additionalInfo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const aboutSchema = new mongoose.Schema<IAbout>(
  {
    shopDescription: {
      type: String,
      required: [true, 'Shop description is required'],
      trim: true,
    },
    shopMission: {
      type: String,
      trim: true,
    },
    ownerInfo: {
      type: String,
      trim: true,
    },
    additionalInfo: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one about document exists
aboutSchema.statics.getAbout = async function () {
  let about = await this.findOne();
  if (!about) {
    about = await this.create({
      shopDescription: 'Welcome to our tiles shop. We provide quality tiles, marble, granite, and accessories.',
      shopMission: 'To provide the best quality products and excellent customer service.',
    });
  }
  return about;
};

export const About = mongoose.model<IAbout>('About', aboutSchema);


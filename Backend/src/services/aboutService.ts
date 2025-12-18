import { About, IAbout } from '../models/About';

export interface UpdateAboutData {
  shopDescription?: string;
  shopMission?: string;
  ownerInfo?: string;
  additionalInfo?: string;
}

export class AboutService {
  /**
   * Get about content (creates default if doesn't exist)
   */
  static async getAbout(): Promise<IAbout> {
    let about = await About.findOne();
    
    if (!about) {
      about = await About.create({
        shopDescription: 'Welcome to our tiles shop. We provide quality tiles, marble, granite, and accessories.',
        shopMission: 'To provide the best quality products and excellent customer service.',
      });
    }
    
    return about;
  }

  /**
   * Update about content
   */
  static async updateAbout(data: UpdateAboutData): Promise<IAbout> {
    let about = await About.findOne();
    
    if (!about) {
      about = await About.create(data);
    } else {
      Object.assign(about, data);
      await about.save();
    }
    
    return about;
  }
}


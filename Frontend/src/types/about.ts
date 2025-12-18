export interface About {
  _id: string;
  shopDescription: string;
  shopMission?: string;
  ownerInfo?: string;
  additionalInfo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAboutData {
  shopDescription?: string;
  shopMission?: string;
  ownerInfo?: string;
  additionalInfo?: string;
}


export interface Shop {
  _id: string;
  shopName: string;
  logo?: string;
  logoUrl?: string;
  address?: string;
  ownerName: string;
  mobileNumbers: string[];
  gstNo?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateShopData {
  shopName?: string;
  address?: string;
  ownerName?: string;
  mobileNumbers?: string[];
  gstNo?: string;
  email?: string;
}

export interface CreateShopData {
  shopName: string;
  address?: string;
  ownerName: string;
  mobileNumbers: string[];
  gstNo?: string;
  email?: string;
  logo?: string;
  logoUrl?: string;
}


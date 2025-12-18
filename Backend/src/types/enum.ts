export enum USER_ROLE {
    ADMIN = 'admin',
}

export enum USER_STATUS {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

export enum USER_GENDER {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other'
}

export enum APPLICATION_STATUS {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export enum PAYMENT_STATUS {
    PENDING = 'pending',
    PAID = 'paid',
    FAILED = 'failed',
}

export enum CATEGORY {
    GENERAL = 'general',
    OBC = 'obc',
    SC = 'sc',
    ST = 'st',
    EWS = 'ews',

}

// Permission enums for shop management system
export enum PERMISSION {
    // Shop management
    MANAGE_SHOP = 'manage_shop',
    VIEW_SHOP = 'view_shop',
    
    // Product management
    MANAGE_PRODUCTS = 'manage_products',
    VIEW_PRODUCTS = 'view_products',
    
    // Bill management
    MANAGE_BILLS = 'manage_bills',
    VIEW_BILLS = 'view_bills',
    
    // About management
    MANAGE_ABOUT = 'manage_about',
    VIEW_ABOUT = 'view_about',
}

// Role permissions mapping - Admin has all permissions
export const ROLE_PERMISSIONS: Record<USER_ROLE, PERMISSION[]> = {
    [USER_ROLE.ADMIN]: [
        PERMISSION.MANAGE_SHOP, PERMISSION.VIEW_SHOP,
        PERMISSION.MANAGE_PRODUCTS, PERMISSION.VIEW_PRODUCTS,
        PERMISSION.MANAGE_BILLS, PERMISSION.VIEW_BILLS,
        PERMISSION.MANAGE_ABOUT, PERMISSION.VIEW_ABOUT,
    ],
};

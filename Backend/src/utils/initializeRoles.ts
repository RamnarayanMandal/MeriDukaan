/**
 * Initialize system - simplified for shop management
 * Admin role is handled directly in User model
 * No complex role management needed - just admin authentication
 */
export async function initializeSystemRoles(): Promise<void> {
  try {
    // For shop management system, we only need admin role
    // Admin role is defined in USER_ROLE enum and handled in User model
    // No need for complex role management system
    console.log('✅ Shop Management System initialized - Admin role available');
  } catch (error) {
    console.error('❌ Failed to initialize system:', error);
    // Don't throw error to prevent application startup failure
  }
} 
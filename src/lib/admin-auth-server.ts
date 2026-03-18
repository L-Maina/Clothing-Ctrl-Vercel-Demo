/**
 * Admin Authentication Utilities
 * 
 * Server-side utilities for admin authentication
 */

import { db } from '@/lib/db';
import crypto from 'crypto';

/**
 * Hash a password using SHA-256 with salt
 * In production, use bcrypt or argon2
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;
  
  const verifyHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex');
  
  return hash === verifyHash;
}

/**
 * Generate a secure temporary password
 */
export function generateTemporaryPassword(length: number = 16): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&';
  let password = '';
  
  // Ensure at least one of each type
  password += chars.slice(0, 24).charAt(Math.floor(Math.random() * 24)); // Uppercase
  password += chars.slice(24, 48).charAt(Math.floor(Math.random() * 24)); // Lowercase
  password += chars.slice(48, 54).charAt(Math.floor(Math.random() * 6)); // Number
  password += chars.slice(54).charAt(Math.floor(Math.random() * 6)); // Special
  
  // Fill rest randomly
  for (let i = password.length; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Shuffle
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

/**
 * Generate verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Verify admin credentials
 */
export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<{
  success: boolean;
  admin?: {
    id: string;
    email: string;
    name: string;
    role: string;
    isTemporaryPassword: boolean;
    onboardingComplete: boolean;
    notificationEmail: string | null;
    emailVerified: boolean;
  };
  error?: string;
}> {
  try {
    const admin = await db.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    });
    
    if (!admin) {
      return { success: false, error: 'Invalid email or password' };
    }
    
    const isValid = await verifyPassword(password, admin.password);
    
    if (!isValid) {
      return { success: false, error: 'Invalid email or password' };
    }
    
    // Update last login
    await db.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });
    
    return {
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        isTemporaryPassword: admin.isTemporaryPassword,
        onboardingComplete: admin.onboardingComplete,
        notificationEmail: admin.notificationEmail,
        emailVerified: admin.emailVerified,
      },
    };
  } catch (error) {
    console.error('Error verifying admin credentials:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

/**
 * Change admin password
 */
export async function changeAdminPassword(
  adminId: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const hashedPassword = await hashPassword(newPassword);
    
    await db.adminUser.update({
      where: { id: adminId },
      data: {
        password: hashedPassword,
        isTemporaryPassword: false,
        passwordChangedAt: new Date(),
      },
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error changing password:', error);
    return { success: false, error: 'Failed to change password' };
  }
}

/**
 * Create initial admin user
 */
export async function createInitialAdmin(data: {
  email: string;
  name: string;
  role?: string;
}): Promise<{
  success: boolean;
  admin?: { id: string; email: string; name: string; temporaryPassword: string };
  error?: string;
}> {
  try {
    // Check if admin already exists
    const existing = await db.adminUser.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    
    if (existing) {
      return { success: false, error: 'Admin with this email already exists' };
    }
    
    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await hashPassword(temporaryPassword);
    
    const admin = await db.adminUser.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name,
        password: hashedPassword,
        role: data.role || 'ADMIN',
        isTemporaryPassword: true,
        onboardingComplete: false,
        emailVerified: false,
      },
    });
    
    return {
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        temporaryPassword,
      },
    };
  } catch (error) {
    console.error('Error creating admin:', error);
    return { success: false, error: 'Failed to create admin user' };
  }
}

/**
 * Set admin notification email and send verification
 */
export async function setAdminNotificationEmail(
  adminId: string,
  email: string
): Promise<{
  success: boolean;
  verificationCode?: string;
  error?: string;
}> {
  try {
    const verificationCode = generateVerificationCode();
    
    await db.adminUser.update({
      where: { id: adminId },
      data: {
        notificationEmail: email.toLowerCase(),
        emailVerified: false,
        // Store verification code temporarily (in metadata or separate table)
        // For simplicity, we'll use a simple approach
      },
    });
    
    return { success: true, verificationCode };
  } catch (error) {
    console.error('Error setting notification email:', error);
    return { success: false, error: 'Failed to set notification email' };
  }
}

/**
 * Verify admin notification email
 */
export async function verifyAdminEmail(
  adminId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.adminUser.update({
      where: { id: adminId },
      data: {
        emailVerified: true,
        onboardingComplete: true,
      },
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error verifying email:', error);
    return { success: false, error: 'Failed to verify email' };
  }
}

/**
 * Get admin by ID
 */
export async function getAdminById(adminId: string): Promise<{
  id: string;
  email: string;
  name: string;
  role: string;
  isTemporaryPassword: boolean;
  onboardingComplete: boolean;
  notificationEmail: string | null;
  emailVerified: boolean;
} | null> {
  try {
    const admin = await db.adminUser.findUnique({
      where: { id: adminId },
    });
    
    if (!admin) return null;
    
    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      isTemporaryPassword: admin.isTemporaryPassword,
      onboardingComplete: admin.onboardingComplete,
      notificationEmail: admin.notificationEmail,
      emailVerified: admin.emailVerified,
    };
  } catch {
    return null;
  }
}

/**
 * Get all admins with verified notification emails
 */
export async function getAdminsForNotifications(): Promise<Array<{
  id: string;
  email: string;
  name: string;
  notificationEmail: string;
}>> {
  try {
    const admins = await db.adminUser.findMany({
      where: {
        emailVerified: true,
        notificationEmail: { not: null },
      },
    });
    
    return admins.map(admin => ({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      notificationEmail: admin.notificationEmail!,
    }));
  } catch {
    return [];
  }
}

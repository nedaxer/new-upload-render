/**
 * Utility functions for generating and managing user UIDs
 */

/**
 * Generates a random mixed alphanumeric UID (up to 10 characters)
 * Uses uppercase letters and numbers for better readability
 */
export function generateUID(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  // Generate 6-10 character UID
  const length = Math.floor(Math.random() * 5) + 6; // 6 to 10 characters
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Validates UID format (alphanumeric, max 10 characters)
 */
export function isValidUID(uid: string): boolean {
  return /^[A-Z0-9]{1,10}$/.test(uid);
}
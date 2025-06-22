/**
 * Generate a mixed alphanumeric UID up to 10 characters
 * Contains uppercase letters, lowercase letters, and numbers
 */
export function generateUID(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  // Generate 8-10 character UID for better uniqueness
  const length = Math.floor(Math.random() * 3) + 8; // 8, 9, or 10 characters
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Check if a UID is valid format (mixed alphanumeric, 1-10 chars)
 */
export function isValidUID(uid: string): boolean {
  if (!uid || uid.length === 0 || uid.length > 10) {
    return false;
  }
  
  // Check if contains at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(uid);
  const hasNumber = /[0-9]/.test(uid);
  const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(uid);
  
  return hasLetter && hasNumber && isAlphanumeric;
}
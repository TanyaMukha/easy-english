// utils/guid.ts

/**
 * Generate a UUID v4 string
 * Single Responsibility: Generate unique identifiers
 */
export const generateGuid = (): string => {
  // Use crypto.randomUUID if available (modern environments)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback implementation for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Generate a short unique ID (for cases where full UUID is not needed)
 */
export const generateShortId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Validate if a string is a valid UUID
 */
export const isValidGuid = (guid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(guid);
};

export default {
  generateGuid,
  generateShortId,
  isValidGuid,
};
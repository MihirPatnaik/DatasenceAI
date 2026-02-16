// src/smartsocial/utils/validation.ts

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Ensure business email (no free domains like Gmail, Yahoo, etc.)
 * Returns an object with validation result and message
 */
export const validateBusinessEmail = (email: string): { isValid: boolean; message: string } => {
  if (!email) return { isValid: true, message: "" };

  if (!validateEmail(email)) {
    return { isValid: false, message: "Please enter a valid email address" };
  }

  const freeDomains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "aol.com"];
  const domain = email.split("@")[1]?.toLowerCase();

  if (domain && freeDomains.includes(domain)) {
    return { isValid: false, message: "Please enter your business email, not a personal email" };
  }

  return { isValid: true, message: "" };
};

/**
 * Validate password strength
 * - Minimum 8 chars
 * - Must contain a number
 * - Must contain uppercase letter
 * - Must contain special character
 */
export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (!password) return { isValid: false, message: "Password is required" };
  if (password.length < 8) return { isValid: false, message: "Password must be at least 8 characters" };
  if (!/\d/.test(password)) return { isValid: false, message: "Password must contain at least one number" };
  if (!/[A-Z]/.test(password)) return { isValid: false, message: "Password must contain at least one uppercase letter" };
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one special character" };
  }

  return { isValid: true, message: "" };
};

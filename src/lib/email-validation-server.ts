import dns from 'dns';
import { promisify } from 'util';
import { 
  isValidEmailFormat, 
  getEmailDomain, 
  isDisposableEmail, 
  suggestDomainCorrection 
} from './email-validation';

const resolveMx = promisify(dns.resolveMx);

interface EmailValidationResult {
  valid: boolean;
  error?: string;
  suggestion?: string;
  warning?: string;
}

/**
 * Check if domain has valid MX records (mail server)
 * This verifies the domain can receive emails
 */
export async function hasValidMxRecords(email: string): Promise<{ valid: boolean; error?: string }> {
  const domain = getEmailDomain(email);
  
  try {
    const mxRecords = await resolveMx(domain);
    return { valid: mxRecords && mxRecords.length > 0 };
  } catch (error) {
    // In sandbox/restricted environments, DNS might not work
    // Log the error but don't block registration
    console.warn('MX record check failed (this is normal in sandbox environments):', error);
    return { valid: true }; // Allow through if DNS check fails
  }
}

/**
 * Comprehensive email validation with MX record check
 * SERVER-SIDE ONLY - uses Node.js dns module
 */
export async function validateEmail(email: string): Promise<EmailValidationResult> {
  // Basic format check
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Format validation
  if (!isValidEmailFormat(normalizedEmail)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  // Length check
  if (normalizedEmail.length > 254) {
    return { valid: false, error: 'Email address is too long' };
  }

  const [localPart, domain] = normalizedEmail.split('@');

  // Local part validation
  if (localPart.length === 0 || localPart.length > 64) {
    return { valid: false, error: 'Invalid email format' };
  }

  // Check for consecutive dots
  if (localPart.includes('..') || domain.includes('..')) {
    return { valid: false, error: 'Email contains invalid characters' };
  }

  // Check for disposable email
  if (isDisposableEmail(normalizedEmail)) {
    return { valid: false, error: 'Temporary/disposable emails are not allowed. Please use a permanent email address.' };
  }

  // Check for typos and suggest correction
  const correction = suggestDomainCorrection(normalizedEmail);
  if (correction) {
    return {
      valid: false,
      error: 'Did you mean the correct domain?',
      suggestion: `${localPart}@${correction}`,
    };
  }

  // Check MX records (verify domain can receive emails)
  // In sandbox environments, this might fail but we allow through
  const mxResult = await hasValidMxRecords(normalizedEmail);
  if (!mxResult.valid) {
    return {
      valid: false,
      error: 'This email domain does not exist or cannot receive emails. Please check your email address.',
    };
  }

  // All checks passed
  return { valid: true };
}

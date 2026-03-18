// Common disposable email domains to block
const DISPOSABLE_DOMAINS = [
  'tempmail.com',
  'throwaway.email',
  'guerrillamail.com',
  'mailinator.com',
  '10minutemail.com',
  'dispostable.com',
  'mailnesia.com',
  'tempmailaddress.com',
  'fakeinbox.com',
  'temp-mail.org',
  'sharklasers.com',
  'grr.la',
  'pokemail.net',
  'spam4.me',
  'yopmail.com',
  'fastmail.fm',
  'maildrop.cc',
  'getairmail.com',
  'mailcatch.com',
  'mohmal.com',
];

// Common typo domains with corrections
const TYPO_DOMAINS: Record<string, string> = {
  'gmail.co': 'gmail.com',
  'gmail.cm': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmail.cmo': 'gmail.com',
  'gmail.om': 'gmail.com',
  'gmail.ocm': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmail.comm': 'gmail.com',
  'yahooo.com': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'yahoo.co': 'yahoo.com',
  'yahoo.con': 'yahoo.com',
  'yahoocom': 'yahoo.com',
  'outlook.con': 'outlook.com',
  'outlook.co': 'outlook.com',
  'outlook.cm': 'outlook.com',
  'hotmal.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotmail.con': 'hotmail.com',
  'hotmail.co': 'hotmail.com',
  'aol.con': 'aol.com',
  'aol.co': 'aol.com',
  'icloud.con': 'icloud.com',
  'icloud.co': 'icloud.com',
  'protonmal.com': 'protonmail.com',
  'protonmail.con': 'protonmail.com',
};

interface EmailValidationResult {
  valid: boolean;
  error?: string;
  suggestion?: string;
  warning?: string;
}

/**
 * Validate email format
 */
export function isValidEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Extract domain from email
 */
export function getEmailDomain(email: string): string {
  return email.split('@')[1]?.toLowerCase() || '';
}

/**
 * Check if domain is a known disposable email provider
 */
export function isDisposableEmail(email: string): boolean {
  const domain = getEmailDomain(email);
  return DISPOSABLE_DOMAINS.includes(domain);
}

/**
 * Check for common typos in email domain and suggest correction
 */
export function suggestDomainCorrection(email: string): string | null {
  const domain = getEmailDomain(email);
  return TYPO_DOMAINS[domain] || null;
}

/**
 * Simple synchronous validation for client-side use
 * (Does not include MX record check - use server-side validateEmail for that)
 */
export function validateEmailSimple(email: string): EmailValidationResult {
  // Basic format check
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Format validation
  if (!isValidEmailFormat(normalizedEmail)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  // Check for disposable email
  if (isDisposableEmail(normalizedEmail)) {
    return { valid: false, error: 'Temporary/disposable emails are not allowed' };
  }

  // Check for typos and suggest correction
  const correction = suggestDomainCorrection(normalizedEmail);
  if (correction) {
    const localPart = normalizedEmail.split('@')[0];
    return {
      valid: true,
      warning: `Did you mean ${localPart}@${correction}?`,
      suggestion: `${localPart}@${correction}`,
    };
  }

  return { valid: true };
}

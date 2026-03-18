/**
 * Email Service Configuration
 * 
 * Supports multiple email providers:
 * - SendGrid (default)
 * - SMTP (Gmail, Outlook, custom)
 * - Resend
 * - Console (development only)
 */

export type EmailProvider = 'sendgrid' | 'smtp' | 'resend' | 'console';

export interface EmailConfig {
  provider: EmailProvider;
  
  // SendGrid configuration
  sendgrid?: {
    apiKey: string;
    fromEmail: string;
    fromName: string;
  };
  
  // SMTP configuration
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    fromEmail: string;
    fromName: string;
  };
  
  // Resend configuration
  resend?: {
    apiKey: string;
    fromEmail: string;
    fromName: string;
  };
  
  // Console (development)
  console?: {
    fromEmail: string;
    fromName: string;
  };
}

// Get email configuration from environment variables
export function getEmailConfig(): EmailConfig {
  const provider = (process.env.EMAIL_PROVIDER as EmailProvider) || 'console';
  
  const config: EmailConfig = { provider };
  
  // SendGrid configuration
  if (process.env.SENDGRID_API_KEY) {
    config.sendgrid = {
      apiKey: process.env.SENDGRID_API_KEY,
      fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@clothingctrl.com',
      fromName: process.env.SENDGRID_FROM_NAME || 'Clothing Ctrl',
    };
  }
  
  // SMTP configuration
  if (process.env.SMTP_HOST) {
    config.smtp = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
      fromEmail: process.env.SMTP_FROM_EMAIL || 'noreply@clothingctrl.com',
      fromName: process.env.SMTP_FROM_NAME || 'Clothing Ctrl',
    };
  }
  
  // Resend configuration
  if (process.env.RESEND_API_KEY) {
    config.resend = {
      apiKey: process.env.RESEND_API_KEY,
      fromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@clothingctrl.com',
      fromName: process.env.RESEND_FROM_NAME || 'Clothing Ctrl',
    };
  }
  
  // Console (development fallback)
  config.console = {
    fromEmail: 'noreply@clothingctrl.com',
    fromName: 'Clothing Ctrl',
  };
  
  return config;
}

// Get the active provider configuration
export function getActiveProviderConfig(config: EmailConfig) {
  switch (config.provider) {
    case 'sendgrid':
      return config.sendgrid;
    case 'smtp':
      return config.smtp;
    case 'resend':
      return config.resend;
    case 'console':
    default:
      return config.console;
  }
}

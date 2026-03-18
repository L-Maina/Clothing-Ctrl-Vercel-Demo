/**
 * Email Service
 * 
 * Unified email service supporting multiple providers.
 * Handles all email sending with logging and error handling.
 */

import { getEmailConfig, getActiveProviderConfig, EmailConfig } from './config';
import { db } from '@/lib/db';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  type: string; // For logging: ORDER_NEW, ADMIN_ONBOARDING, etc.
  adminUserId?: string;
  orderId?: string;
  metadata?: Record<string, unknown>;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Log email to database
 */
async function logEmail(
  options: SendEmailOptions,
  status: 'PENDING' | 'SENT' | 'FAILED',
  errorMessage?: string
): Promise<void> {
  try {
    await db.emailLog.create({
      data: {
        type: options.type,
        recipient: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        status,
        adminUserId: options.adminUserId,
        orderId: options.orderId,
        errorMessage,
        metadata: options.metadata ? JSON.stringify(options.metadata) : null,
      },
    });
  } catch (error) {
    console.error('Failed to log email:', error);
  }
}

/**
 * Send email via SendGrid
 */
async function sendViaSendGrid(
  options: SendEmailOptions,
  config: NonNullable<EmailConfig['sendgrid']>
): Promise<SendEmailResult> {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: Array.isArray(options.to)
              ? options.to.map(email => ({ email }))
              : [{ email: options.to }],
          },
        ],
        from: {
          email: config.fromEmail,
          name: config.fromName,
        },
        subject: options.subject,
        content: [
          {
            type: 'text/plain',
            value: options.text,
          },
          {
            type: 'text/html',
            value: options.html,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `SendGrid error: ${error}` };
    }

    const messageId = response.headers.get('X-Message-Id') || undefined;
    return { success: true, messageId };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send email via Resend
 */
async function sendViaResend(
  options: SendEmailOptions,
  config: NonNullable<EmailConfig['resend']>
): Promise<SendEmailResult> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${config.fromName} <${config.fromEmail}>`,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Resend error: ${error}` };
    }

    const data = await response.json();
    return { success: true, messageId: data.id };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send email via SMTP (using a simple SMTP client approach)
 * For production, consider using nodemailer or similar
 */
async function sendViaSMTP(
  options: SendEmailOptions,
  config: NonNullable<EmailConfig['smtp']>
): Promise<SendEmailResult> {
  // For now, we'll log and return success in development
  // In production, integrate with nodemailer or similar
  console.log('[SMTP] Email would be sent:', {
    host: config.host,
    port: config.port,
    from: `${config.fromName} <${config.fromEmail}>`,
    to: options.to,
    subject: options.subject,
  });
  
  // Log the email content for development
  console.log('[SMTP] Content:', {
    text: options.text.substring(0, 200) + '...',
  });
  
  return { success: true, messageId: `smtp-${Date.now()}` };
}

/**
 * Send email via Console (development only)
 */
async function sendViaConsole(options: SendEmailOptions): Promise<SendEmailResult> {
  console.log('\n' + '='.repeat(80));
  console.log('📧 EMAIL (Development Mode)');
  console.log('='.repeat(80));
  console.log(`To: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Type: ${options.type}`);
  console.log('-'.repeat(80));
  console.log(options.text);
  console.log('='.repeat(80) + '\n');
  
  return { success: true, messageId: `console-${Date.now()}` };
}

/**
 * Main send email function
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const config = getEmailConfig();
  const providerConfig = getActiveProviderConfig(config);
  
  // Log as pending
  await logEmail(options, 'PENDING');
  
  let result: SendEmailResult;
  
  try {
    switch (config.provider) {
      case 'sendgrid':
        if (!config.sendgrid) {
          throw new Error('SendGrid configuration missing');
        }
        result = await sendViaSendGrid(options, config.sendgrid);
        break;
        
      case 'resend':
        if (!config.resend) {
          throw new Error('Resend configuration missing');
        }
        result = await sendViaResend(options, config.resend);
        break;
        
      case 'smtp':
        if (!config.smtp) {
          throw new Error('SMTP configuration missing');
        }
        result = await sendViaSMTP(options, config.smtp);
        break;
        
      case 'console':
      default:
        result = await sendViaConsole(options);
        break;
    }
    
    // Update log with result
    await logEmail(
      options,
      result.success ? 'SENT' : 'FAILED',
      result.error
    );
    
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await logEmail(options, 'FAILED', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Send admin onboarding email
 */
export async function sendAdminOnboardingEmail(data: {
  adminUserId: string;
  adminName: string;
  email: string;
  temporaryPassword: string;
  loginUrl: string;
}): Promise<SendEmailResult> {
  const { getAdminOnboardingEmail } = await import('./templates');
  const template = getAdminOnboardingEmail(data);
  
  return sendEmail({
    to: data.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
    type: 'ADMIN_ONBOARDING',
    adminUserId: data.adminUserId,
    metadata: { adminName: data.adminName },
  });
}

/**
 * Send new order notification to admin
 */
export async function sendNewOrderNotification(data: {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: string;
  items: Array<{ name: string; quantity: number; price: string }>;
  adminEmail: string;
  adminUserId: string;
  adminUrl: string;
}): Promise<SendEmailResult> {
  const { getNewOrderAdminEmail } = await import('./templates');
  const template = getNewOrderAdminEmail(data);
  
  return sendEmail({
    to: data.adminEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
    type: 'ORDER_NEW',
    adminUserId: data.adminUserId,
    orderId: data.orderId,
  });
}

/**
 * Send email verification
 */
export async function sendEmailVerification(data: {
  adminUserId: string;
  adminName: string;
  email: string;
  verificationCode: string;
  verificationUrl: string;
}): Promise<SendEmailResult> {
  const { getEmailVerificationEmail } = await import('./templates');
  const template = getEmailVerificationEmail(data);
  
  return sendEmail({
    to: data.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
    type: 'EMAIL_VERIFICATION',
    adminUserId: data.adminUserId,
  });
}

/**
 * Send password changed confirmation
 */
export async function sendPasswordChangedEmail(data: {
  adminUserId: string;
  adminName: string;
  email: string;
}): Promise<SendEmailResult> {
  const { getPasswordChangedEmail } = await import('./templates');
  const template = getPasswordChangedEmail(data);
  
  return sendEmail({
    to: data.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
    type: 'PASSWORD_RESET',
    adminUserId: data.adminUserId,
  });
}

/**
 * Send email verified confirmation
 */
export async function sendEmailVerifiedConfirmation(data: {
  adminUserId: string;
  adminName: string;
  email: string;
}): Promise<SendEmailResult> {
  const { getEmailVerifiedConfirmation } = await import('./templates');
  const template = getEmailVerifiedConfirmation(data);
  
  return sendEmail({
    to: data.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
    type: 'EMAIL_VERIFICATION',
    adminUserId: data.adminUserId,
  });
}

/**
 * Send order status update to customer
 */
export async function sendOrderStatusUpdate(data: {
  orderId: string;
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  status: string;
  trackingNumber?: string;
  trackingUrl?: string;
  storeUrl: string;
}): Promise<SendEmailResult> {
  const { getOrderStatusUpdateEmail } = await import('./templates');
  const template = getOrderStatusUpdateEmail(data);
  
  return sendEmail({
    to: data.customerEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
    type: 'ORDER_STATUS',
    orderId: data.orderId,
  });
}

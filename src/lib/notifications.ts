import { db } from '@/lib/db';

// Types for notification service
export interface SMSNotification {
  to: string;
  message: string;
  orderId?: string;
}

export interface EmailNotification {
  to: string;
  subject: string;
  message: string;
  html?: string;
  orderId?: string;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send SMS notification (Mock Implementation)
 * TODO: Integrate with actual SMS provider (e.g., Africa's Talking, Twilio)
 * 
 * For Kenya, recommended providers:
 * - Africa's Talking (https://africastalking.com/)
 * - Twilio (https://twilio.com)
 * - BulkSMS (https://bulksms.com/)
 */
export async function sendSMS(notification: SMSNotification): Promise<NotificationResult> {
  const { to, message, orderId } = notification;

  try {
    // Mock implementation - in production, integrate with SMS provider
    // Example for Africa's Talking:
    // const credentials = {
    //   apiKey: process.env.AFRICASTALKING_API_KEY,
    //   username: process.env.AFRICASTALKING_USERNAME,
    // };
    // const africastalking = AfricanTalking(credentials);
    // const result = await africastalking.SMS.send({
    //   to: to,
    //   message: message,
    //   from: 'CLOTHCTRL',
    // });

    // Log the notification
    await db.notificationLog.create({
      data: {
        type: 'SMS',
        recipient: to,
        message: message,
        status: 'SENT',
        orderId: orderId,
      },
    });

    // Simulate successful SMS
    console.log(`[SMS MOCK] To: ${to}, Message: ${message}`);

    return {
      success: true,
      messageId: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Log the failed notification
    await db.notificationLog.create({
      data: {
        type: 'SMS',
        recipient: to,
        message: message,
        status: 'FAILED',
        orderId: orderId,
        errorMessage: errorMessage,
      },
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send Email notification (Mock Implementation)
 * TODO: Integrate with actual email provider (e.g., SendGrid, Resend, AWS SES)
 * 
 * Recommended providers:
 * - Resend (https://resend.com) - Modern and developer-friendly
 * - SendGrid (https://sendgrid.com)
 * - AWS SES (https://aws.amazon.com/ses/)
 */
export async function sendEmail(notification: EmailNotification): Promise<NotificationResult> {
  const { to, subject, message, html, orderId } = notification;

  try {
    // Mock implementation - in production, integrate with email provider
    // Example for Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // const result = await resend.emails.send({
    //   from: 'Clothing Ctrl <noreply@clothingctrl.com>',
    //   to: to,
    //   subject: subject,
    //   html: html || message,
    // });

    // Log the notification
    await db.notificationLog.create({
      data: {
        type: 'EMAIL',
        recipient: to,
        subject: subject,
        message: html || message,
        status: 'SENT',
        orderId: orderId,
      },
    });

    // Simulate successful email
    console.log(`[EMAIL MOCK] To: ${to}, Subject: ${subject}`);

    return {
      success: true,
      messageId: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Log the failed notification
    await db.notificationLog.create({
      data: {
        type: 'EMAIL',
        recipient: to,
        subject: subject,
        message: html || message,
        status: 'FAILED',
        orderId: orderId,
        errorMessage: errorMessage,
      },
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send order confirmation notification (SMS + Email)
 */
export async function sendOrderConfirmation(data: {
  customerName: string;
  email: string;
  phone?: string;
  orderNumber: string;
  total: number;
  currency: string;
  orderId: string;
}): Promise<void> {
  const { customerName, email, phone, orderNumber, total, currency, orderId } = data;

  // Send email confirmation
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a;">Thank you for your order, ${customerName}!</h1>
      <p>Your order has been confirmed.</p>
      <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Total:</strong> ${currency} ${total.toLocaleString()}</p>
      </div>
      <p>We'll send you another notification when your order ships.</p>
      <p>Best regards,<br>Clothing Ctrl Team</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Order Confirmation - ${orderNumber}`,
    message: `Thank you for your order! Order #${orderNumber} confirmed. Total: ${currency} ${total.toLocaleString()}`,
    html: emailHtml,
    orderId,
  });

  // Send SMS confirmation if phone provided
  if (phone) {
    await sendSMS({
      to: phone,
      message: `Clothing Ctrl: Your order #${orderNumber} has been confirmed! Total: ${currency} ${total.toLocaleString()}. We'll notify you when it ships.`,
      orderId,
    });
  }
}

/**
 * Send order status update notification
 */
export async function sendOrderStatusUpdate(data: {
  customerName: string;
  email: string;
  phone?: string;
  orderNumber: string;
  status: string;
  trackingNumber?: string;
  trackingUrl?: string;
  orderId: string;
}): Promise<void> {
  const { customerName, email, phone, orderNumber, status, trackingNumber, trackingUrl, orderId } = data;

  const statusMessages: Record<string, string> = {
    PROCESSING: 'is being processed',
    SHIPPED: 'has been shipped',
    DELIVERED: 'has been delivered',
    CANCELLED: 'has been cancelled',
  };

  const statusMessage = statusMessages[status] || `status updated to ${status}`;

  // Send email
  let emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a;">Order Update, ${customerName}!</h1>
      <p>Your order <strong>#${orderNumber}</strong> ${statusMessage}.</p>
  `;

  if (trackingNumber) {
    emailHtml += `
      <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
        <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
        ${trackingUrl ? `<a href="${trackingUrl}" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none;">Track Your Order</a>` : ''}
      </div>
    `;
  }

  emailHtml += `
      <p>Best regards,<br>Clothing Ctrl Team</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Order Update - ${orderNumber}`,
    message: `Your order #${orderNumber} ${statusMessage}. ${trackingNumber ? `Tracking: ${trackingNumber}` : ''}`,
    html: emailHtml,
    orderId,
  });

  // Send SMS if phone provided
  if (phone) {
    let smsMessage = `Clothing Ctrl: Order #${orderNumber} ${statusMessage}.`;
    if (trackingNumber) {
      smsMessage += ` Track: ${trackingNumber}`;
    }
    await sendSMS({
      to: phone,
      message: smsMessage,
      orderId,
    });
  }
}

/**
 * Send review request notification after delivery
 */
export async function sendReviewRequest(data: {
  customerName: string;
  email: string;
  orderNumber: string;
  orderId: string;
}): Promise<void> {
  const { customerName, email, orderNumber, orderId } = data;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a;">How was your order, ${customerName}?</h1>
      <p>We'd love to hear your feedback on your recent order <strong>#${orderNumber}</strong>.</p>
      <p>Share your experience and help other customers make informed decisions.</p>
      <p>Best regards,<br>Clothing Ctrl Team</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Share Your Experience - Order ${orderNumber}`,
    message: `How was your order #${orderNumber}? We'd love to hear your feedback!`,
    html: emailHtml,
    orderId,
  });
}

// Export notification log for admin view
export async function getNotificationLogs(limit = 50) {
  return db.notificationLog.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
}

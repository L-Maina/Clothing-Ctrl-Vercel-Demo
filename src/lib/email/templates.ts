/**
 * Email Templates
 * 
 * All email templates for the Clothing Ctrl platform
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Base email styling
const baseStyles = `
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
    .container { background: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #000; text-decoration: none; }
    .logo span { color: #f59e0b; }
    .content { margin-bottom: 30px; }
    .button { display: inline-block; background: #f59e0b; color: #000; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 20px 0; }
    .button:hover { background: #d97706; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
    .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
    .success { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
    .info { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
    code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
    .credentials { background: #1f2937; color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .credentials p { margin: 8px 0; }
    .credentials strong { color: #f59e0b; }
  </style>
`;

// Admin Onboarding Email - Sent with temporary credentials
export function getAdminOnboardingEmail(data: {
  adminName: string;
  email: string;
  temporaryPassword: string;
  loginUrl: string;
}): EmailTemplate {
  const { adminName, email, temporaryPassword, loginUrl } = data;
  
  return {
    subject: 'Welcome to Clothing Ctrl - Your Admin Account is Ready',
    html: `
      <!DOCTYPE html>
      <html>
      <head>${baseStyles}</head>
      <body>
        <div class="container">
          <div class="header">
            <a href="#" class="logo">Clothing<span>Ctrl</span></a>
          </div>
          
          <div class="content">
            <h2>Welcome to Clothing Ctrl, ${adminName}!</h2>
            <p>Your admin account has been created. You can now access the admin portal to manage your store.</p>
            
            <div class="alert">
              <strong>⚠️ Important:</strong> This is a one-time temporary password. You will be required to change it on your first login.
            </div>
            
            <div class="credentials">
              <p><strong>Login URL:</strong> <a href="${loginUrl}" style="color: #f59e0b;">${loginUrl}</a></p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Temporary Password:</strong> <code>${temporaryPassword}</code></p>
            </div>
            
            <p style="text-align: center;">
              <a href="${loginUrl}" class="button">Access Admin Portal</a>
            </p>
            
            <h3>Next Steps:</h3>
            <ol>
              <li>Click the button above to access the admin portal</li>
              <li>Log in with your temporary credentials</li>
              <li>Create a new secure password</li>
              <li>Confirm your notification email address</li>
            </ol>
            
            <p>After completing these steps, you'll have full access to all admin features and will receive order notifications at your confirmed email address.</p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Clothing Ctrl. All rights reserved.</p>
            <p>This email was sent to ${email}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to Clothing Ctrl, ${adminName}!

Your admin account has been created. You can now access the admin portal to manage your store.

⚠️ IMPORTANT: This is a one-time temporary password. You will be required to change it on your first login.

Login URL: ${loginUrl}
Email: ${email}
Temporary Password: ${temporaryPassword}

Next Steps:
1. Click the login URL above
2. Log in with your temporary credentials
3. Create a new secure password
4. Confirm your notification email address

After completing these steps, you'll have full access to all admin features.

© ${new Date().getFullYear()} Clothing Ctrl
    `
  };
}

// Password Changed Confirmation
export function getPasswordChangedEmail(data: {
  adminName: string;
  email: string;
}): EmailTemplate {
  const { adminName, email } = data;
  
  return {
    subject: 'Password Changed Successfully - Clothing Ctrl Admin',
    html: `
      <!DOCTYPE html>
      <html>
      <head>${baseStyles}</head>
      <body>
        <div class="container">
          <div class="header">
            <a href="#" class="logo">Clothing<span>Ctrl</span></a>
          </div>
          
          <div class="content">
            <h2>Password Updated Successfully</h2>
            <p>Hello ${adminName},</p>
            
            <div class="success">
              <strong>✓ Your password has been changed.</strong>
            </div>
            
            <p>Your admin account password was successfully updated. You can now use your new password to access the admin portal.</p>
            
            <p>If you did not make this change, please contact support immediately.</p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Clothing Ctrl. All rights reserved.</p>
            <p>This email was sent to ${email}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Password Updated Successfully

Hello ${adminName},

✓ Your password has been changed.

Your admin account password was successfully updated. You can now use your new password to access the admin portal.

If you did not make this change, please contact support immediately.

© ${new Date().getFullYear()} Clothing Ctrl
    `
  };
}

// Email Verification for Admin Notifications
export function getEmailVerificationEmail(data: {
  adminName: string;
  email: string;
  verificationUrl: string;
  verificationCode: string;
}): EmailTemplate {
  const { adminName, email, verificationUrl, verificationCode } = data;
  
  return {
    subject: 'Verify Your Notification Email - Clothing Ctrl',
    html: `
      <!DOCTYPE html>
      <html>
      <head>${baseStyles}</head>
      <body>
        <div class="container">
          <div class="header">
            <a href="#" class="logo">Clothing<span>Ctrl</span></a>
          </div>
          
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Hello ${adminName},</p>
            
            <p>Please verify your email address to receive important notifications about orders, customers, and store activity.</p>
            
            <div class="credentials">
              <p><strong>Verification Code:</strong></p>
              <p style="font-size: 24px; letter-spacing: 4px; text-align: center; margin: 20px 0;">
                <code style="font-size: 24px;">${verificationCode}</code>
              </p>
            </div>
            
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email</a>
            </p>
            
            <p>Or enter the verification code in your admin settings.</p>
            
            <div class="info">
              <strong>Why verify?</strong> This email will receive notifications for:
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>New orders</li>
                <li>Order status updates</li>
                <li>Low stock alerts</li>
                <li>Customer registrations</li>
              </ul>
            </div>
            
            <p>This code will expire in 15 minutes.</p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Clothing Ctrl. All rights reserved.</p>
            <p>This email was sent to ${email}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Verify Your Email Address

Hello ${adminName},

Please verify your email address to receive important notifications about orders, customers, and store activity.

Verification Code: ${verificationCode}

Or visit: ${verificationUrl}

This code will expire in 15 minutes.

Why verify? This email will receive notifications for:
- New orders
- Order status updates
- Low stock alerts
- Customer registrations

© ${new Date().getFullYear()} Clothing Ctrl
    `
  };
}

// New Order Notification for Admin
export function getNewOrderAdminEmail(data: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: string;
  items: Array<{ name: string; quantity: number; price: string }>;
  adminUrl: string;
}): EmailTemplate {
  const { orderNumber, customerName, customerEmail, total, items, adminUrl } = data;
  
  const itemsList = items.map(item => 
    `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item.price}</td></tr>`
  ).join('');
  
  return {
    subject: `🎉 New Order #${orderNumber} - Clothing Ctrl`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>${baseStyles}</head>
      <body>
        <div class="container">
          <div class="header">
            <a href="#" class="logo">Clothing<span>Ctrl</span></a>
          </div>
          
          <div class="content">
            <div class="success">
              <strong>🎉 New Order Received!</strong>
            </div>
            
            <h2>Order #${orderNumber}</h2>
            
            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Email:</strong> ${customerEmail}</p>
            
            <h3>Order Items:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f9fafb;">
                  <th style="padding: 8px; text-align: left;">Product</th>
                  <th style="padding: 8px; text-align: center;">Qty</th>
                  <th style="padding: 8px; text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
              <tfoot>
                <tr style="background: #f9fafb; font-weight: bold;">
                  <td colspan="2" style="padding: 12px;">Total</td>
                  <td style="padding: 12px; text-align: right;">${total}</td>
                </tr>
              </tfoot>
            </table>
            
            <p style="text-align: center;">
              <a href="${adminUrl}" class="button">View Order Details</a>
            </p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Clothing Ctrl. All rights reserved.</p>
            <p>You're receiving this because you're an admin for Clothing Ctrl</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
🎉 New Order Received!

Order #${orderNumber}

Customer: ${customerName}
Email: ${customerEmail}

Order Items:
${items.map(item => `- ${item.name} x${item.quantity} - ${item.price}`).join('\n')}

Total: ${total}

View Order: ${adminUrl}

© ${new Date().getFullYear()} Clothing Ctrl
    `
  };
}

// Order Status Update for Customer
export function getOrderStatusUpdateEmail(data: {
  customerName: string;
  orderNumber: string;
  status: string;
  trackingNumber?: string;
  trackingUrl?: string;
  storeUrl: string;
}): EmailTemplate {
  const { customerName, orderNumber, status, trackingNumber, trackingUrl, storeUrl } = data;
  
  const statusMessages: Record<string, string> = {
    PROCESSING: 'Your order is being processed and will be shipped soon.',
    SHIPPED: 'Great news! Your order has been shipped.',
    DELIVERED: 'Your order has been delivered. Enjoy!',
    CANCELLED: 'Your order has been cancelled.',
  };
  
  return {
    subject: `Order #${orderNumber} Update - ${status} - Clothing Ctrl`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>${baseStyles}</head>
      <body>
        <div class="container">
          <div class="header">
            <a href="${storeUrl}" class="logo">Clothing<span>Ctrl</span></a>
          </div>
          
          <div class="content">
            <h2>Order Update</h2>
            <p>Hello ${customerName},</p>
            
            <div class="info">
              <strong>Order #${orderNumber}</strong><br>
              Status: <strong>${status}</strong>
            </div>
            
            <p>${statusMessages[status] || 'Your order status has been updated.'}</p>
            
            ${trackingNumber ? `
              <div class="credentials">
                <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
                ${trackingUrl ? `<p><a href="${trackingUrl}" style="color: #f59e0b;">Track Your Package</a></p>` : ''}
              </div>
            ` : ''}
            
            <p style="text-align: center;">
              <a href="${storeUrl}" class="button">Visit Store</a>
            </p>
            
            <p>Thank you for shopping with Clothing Ctrl!</p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Clothing Ctrl. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Order Update

Hello ${customerName},

Order #${orderNumber}
Status: ${status}

${statusMessages[status] || 'Your order status has been updated.'}

${trackingNumber ? `Tracking Number: ${trackingNumber}` : ''}

Visit Store: ${storeUrl}

Thank you for shopping with Clothing Ctrl!

© ${new Date().getFullYear()} Clothing Ctrl
    `
  };
}

// Email Verified Confirmation
export function getEmailVerifiedConfirmation(data: {
  adminName: string;
  email: string;
}): EmailTemplate {
  const { adminName, email } = data;
  
  return {
    subject: 'Email Verified Successfully - Clothing Ctrl Admin',
    html: `
      <!DOCTYPE html>
      <html>
      <head>${baseStyles}</head>
      <body>
        <div class="container">
          <div class="header">
            <a href="#" class="logo">Clothing<span>Ctrl</span></a>
          </div>
          
          <div class="content">
            <div class="success">
              <strong>✓ Email Verified!</strong>
            </div>
            
            <h2>Onboarding Complete!</h2>
            <p>Hello ${adminName},</p>
            
            <p>Your email <strong>${email}</strong> has been verified. You will now receive notifications for:</p>
            
            <ul>
              <li>🛒 New orders</li>
              <li>📦 Order status changes</li>
              <li>👤 New customer registrations</li>
              <li>⚠️ Low stock alerts</li>
            </ul>
            
            <p>You can update your notification preferences anytime in the admin settings.</p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Clothing Ctrl. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
✓ Email Verified!

Hello ${adminName},

Your email ${email} has been verified. You will now receive notifications for:
- New orders
- Order status changes
- New customer registrations
- Low stock alerts

You can update your notification preferences anytime in the admin settings.

© ${new Date().getFullYear()} Clothing Ctrl
    `
  };
}

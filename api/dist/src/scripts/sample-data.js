"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function createDefaultEmailTemplates() {
    console.log('📧 Creating default email templates...');
    const templates = [
        {
            name: 'Welcome Email - Professional',
            category: client_1.EmailTemplateCategory.WELCOME,
            subject: 'Welcome to {appName} - Your Account is Ready',
            htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to {appName}, {firstName}!</h2>
          <p>We're excited to have you join our team. Your account has been successfully created.</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Your Login Details:</h3>
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Temporary Password:</strong> {password}</p>
          </div>
          <p style="color: #666; font-size: 14px;">
            Please log in and change your password immediately after your first login for security purposes.
          </p>
          <p>If you have any questions, feel free to contact your administrator.</p>
          <p>Best regards,<br>The {appName} Team</p>
        </div>
      `,
            textContent: `
Welcome to {appName}, {firstName}!

We're excited to have you join our team. Your account has been successfully created.

Your Login Details:
Email: {email}
Temporary Password: {password}

Please log in and change your password immediately after your first login for security purposes.

If you have any questions, feel free to contact your administrator.

Best regards,
The {appName} Team
      `,
            variables: ['firstName', 'email', 'password', 'appName'],
            isDefault: true,
            isActive: true,
            createdBy: 1,
        },
        {
            name: 'Welcome Email - Simple',
            category: client_1.EmailTemplateCategory.WELCOME,
            subject: '{appName} - Welcome {firstName}',
            htmlContent: `
        <p>Hello {firstName},</p>
        <p>Your account has been created on <b>{appName}</b>.</p>
        <p><strong>Login email:</strong> {email}</p>
        <p><strong>Temporary password:</strong> {password}</p>
        <p>Please log in and change your password after first login.</p>
        <p>If you did not expect this email, please contact your administrator.</p>
      `,
            textContent: `
Hello {firstName},

Your account has been created on {appName}.

Login email: {email}
Temporary password: {password}

Please log in and change your password after first login.

If you did not expect this email, please contact your administrator.
      `,
            variables: ['firstName', 'email', 'password', 'appName'],
            isDefault: false,
            isActive: true,
            createdBy: 1,
        },
        {
            name: 'Email Verification',
            category: client_1.EmailTemplateCategory.EMAIL_VERIFICATION,
            subject: '{appName} - Verify Your Email Address',
            htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Verify Your Email Address</h2>
          <p>Hello {firstName},</p>
          <p>Thank you for registering with {appName}. To complete your registration, please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{verificationLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email Address</a>
          </div>
          <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">{verificationLink}</p>
          <p>If you did not create an account, please ignore this email.</p>
          <p>Best regards,<br>The {appName} Team</p>
        </div>
      `,
            textContent: `
Verify Your Email Address

Hello {firstName},

Thank you for registering with {appName}. To complete your registration, please verify your email address by clicking the link below:

{verificationLink}

This link will expire in 24 hours.

If you did not create an account, please ignore this email.

Best regards,
The {appName} Team
      `,
            variables: ['firstName', 'verificationLink', 'appName'],
            isDefault: true,
            isActive: true,
            createdBy: 1,
        },
        {
            name: 'Password Reset',
            category: client_1.EmailTemplateCategory.PASSWORD_RESET,
            subject: '{appName} - Reset Your Password',
            htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Reset Your Password</h2>
          <p>Hello {firstName},</p>
          <p>You have requested to reset your password for your {appName} account. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{resetLink}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hour for security reasons.</p>
          <p>If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">{resetLink}</p>
          <p>Best regards,<br>The {appName} Team</p>
        </div>
      `,
            textContent: `
Reset Your Password

Hello {firstName},

You have requested to reset your password for your {appName} account. Click the link below to create a new password:

{resetLink}

This link will expire in 1 hour for security reasons.

If you did not request a password reset, please ignore this email. Your password will remain unchanged.

Best regards,
The {appName} Team
      `,
            variables: ['firstName', 'resetLink', 'appName'],
            isDefault: true,
            isActive: true,
            createdBy: 1,
        },
        {
            name: 'Email Change Confirmation',
            category: client_1.EmailTemplateCategory.EMAIL_CHANGE_CONFIRMATION,
            subject: '{appName} - Your Email Address Has Been Updated',
            htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Address Updated</h2>
          <p>Hello {firstName},</p>
          <p>Your email address has been successfully updated in {appName}.</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">New Email Address:</h3>
            <p style="font-size: 18px; font-weight: bold; color: #007bff;">{email}</p>
          </div>
          <p>If you did not request this change, please contact your administrator immediately.</p>
          <p>You can now log in with your new email address.</p>
          <p>Best regards,<br>The {appName} Team</p>
        </div>
      `,
            textContent: `
Email Address Updated

Hello {firstName},

Your email address has been successfully updated in {appName}.

New Email Address: {email}

If you did not request this change, please contact your administrator immediately.

You can now log in with your new email address.

Best regards,
The {appName} Team
      `,
            variables: ['firstName', 'email', 'appName'],
            isDefault: true,
            isActive: true,
            createdBy: 1,
        },
    ];
    for (const template of templates) {
        const existing = await prisma.emailTemplate.findFirst({
            where: {
                name: template.name,
                deletedAt: null,
            },
        });
        if (!existing) {
            await prisma.emailTemplate.create({
                data: template,
            });
            console.log(`✅ Created template: ${template.name}`);
        }
        else {
            console.log(`ℹ️  Template already exists: ${template.name}`);
        }
    }
    console.log('🎉 Default email templates setup complete!');
}
createDefaultEmailTemplates()
    .catch((e) => {
    console.error('❌ Error creating email templates:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=sample-data.js.map
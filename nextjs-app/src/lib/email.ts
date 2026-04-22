import { EmailClient } from '@azure/communication-email';
import { CONTACT_EMAIL, OUTBOUND_SENDER_EMAIL } from '@/lib/site';

export type EmailDeliveryResult = {
  status: 'sent' | 'skipped' | 'failed';
  reason?: string;
};

type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  plainText: string;
  replyTo?: string;
};

const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING;
const senderAddress = process.env.AZURE_EMAIL_SENDER || OUTBOUND_SENDER_EMAIL;
const notificationAddress = process.env.CONTACT_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || CONTACT_EMAIL;

function getBaseUrl() {
  return process.env.NEXTAUTH_URL || 'http://localhost:3000';
}

function getClient() {
  if (!connectionString) {
    return null;
  }

  return new EmailClient(connectionString);
}

async function sendEmail({ to, subject, html, plainText, replyTo }: SendEmailInput): Promise<EmailDeliveryResult> {
  const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean);

  if (!recipients.length) {
    return { status: 'skipped', reason: 'No recipient address provided' };
  }

  const client = getClient();
  if (!client) {
    return { status: 'skipped', reason: 'AZURE_COMMUNICATION_CONNECTION_STRING is not configured' };
  }

  try {
    const poller = await client.beginSend({
      senderAddress,
      content: {
        subject,
        plainText,
        html,
      },
      recipients: {
        to: recipients.map((address) => ({ address })),
      },
      replyTo: replyTo ? [{ address: replyTo }] : undefined,
    });

    await poller.pollUntilDone();
    return { status: 'sent' };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown email delivery error';
    console.error('Email delivery error:', reason);
    return { status: 'failed', reason };
  }
}

export async function sendInviteEmail(to: string, token: string, role: string) {
  const inviteUrl = `${getBaseUrl()}/register?token=${encodeURIComponent(token)}`;

  return sendEmail({
    to,
    subject: 'Your Sherwood Technology Consulting account invitation',
    plainText: [
      `You have been invited to Sherwood Technology Consulting as a ${role.toLowerCase()}.`,
      '',
      `Complete your account setup here: ${inviteUrl}`,
      '',
      'This invitation expires in 7 days.',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h2 style="margin-bottom: 12px;">You have been invited to Sherwood Technology Consulting</h2>
        <p>You have been invited to join as a <strong>${role.toLowerCase()}</strong>.</p>
        <p>
          <a href="${inviteUrl}" style="display: inline-block; padding: 10px 16px; background: #0f766e; color: #ffffff; text-decoration: none; border-radius: 8px;">
            Complete account setup
          </a>
        </p>
        <p>If the button does not work, use this link:</p>
        <p><a href="${inviteUrl}">${inviteUrl}</a></p>
        <p>This invitation expires in 7 days.</p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(to: string, name: string) {
  const loginUrl = `${getBaseUrl()}/login`;

  return sendEmail({
    to,
    subject: 'Welcome to Sherwood Technology Consulting',
    plainText: [
      `Welcome ${name},`,
      '',
      'Your account is ready.',
      `Log in here: ${loginUrl}`,
      '',
      `If you need anything, reply to ${CONTACT_EMAIL}.`,
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h2 style="margin-bottom: 12px;">Welcome to Sherwood Technology Consulting</h2>
        <p>Hi ${name}, your account is ready.</p>
        <p>
          <a href="${loginUrl}" style="display: inline-block; padding: 10px 16px; background: #0f766e; color: #ffffff; text-decoration: none; border-radius: 8px;">
            Log in
          </a>
        </p>
        <p>If you need anything, reply to <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>
      </div>
    `,
  });
}

export async function sendContactNotification(name: string, email: string, subject: string, message: string) {
  return sendEmail({
    to: notificationAddress,
    subject: `New contact form message: ${subject}`,
    replyTo: email,
    plainText: [
      'New contact form submission received.',
      '',
      `Name: ${name}`,
      `Email: ${email}`,
      `Subject: ${subject}`,
      '',
      message,
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h2 style="margin-bottom: 12px;">New contact form submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <div style="white-space: pre-wrap; border-left: 3px solid #0f766e; padding-left: 12px;">${message}</div>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${getBaseUrl()}/reset-password?token=${encodeURIComponent(token)}`;

  return sendEmail({
    to,
    subject: 'Reset your Sherwood Technology Consulting password',
    plainText: [
      'You requested a password reset.',
      '',
      `Reset your password here: ${resetUrl}`,
      '',
      'This link expires in 1 hour. If you did not request this, ignore this email.',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 520px;">
        <h2 style="color: #0f766e;">Reset your password</h2>
        <p>Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
        <a href="${resetUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#0f766e;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">Reset Password</a>
        <p style="color:#64748b;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

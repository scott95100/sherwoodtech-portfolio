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

    const result = await poller.pollUntilDone();

    if (result.status !== 'Succeeded') {
      const reason = [
        `ACS email send did not succeed`,
        `status=${result.status}`,
        result.error?.message ? `message=${result.error.message}` : null,
        result.error?.code ? `code=${result.error.code}` : null,
      ]
        .filter(Boolean)
        .join(', ');

      console.error('Email delivery error:', reason, {
        operationId: result.id,
        senderAddress,
        recipients,
        subject,
      });

      return { status: 'failed', reason };
    }

    console.info('Email sent successfully', {
      operationId: result.id,
      senderAddress,
      recipients,
      subject,
    });

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

export async function sendBetaApplicationConfirmation(to: string, name: string) {
  const platformUrl = `${getBaseUrl()}/platform`;

  return sendEmail({
    to,
    subject: 'Your Omnis DevOps beta application — received',
    plainText: [
      `Hi ${name},`,
      '',
      'We received your application for the Omnis DevOps beta. Thank you for taking the time to apply.',
      '',
      'This is not a generic waitlist. We review each application individually and prioritize teams with real deployment, uptime, and client-reporting pain.',
      '',
      'What happens next:',
      '  1. We review your application for fit.',
      '  2. If you are a strong match, we will reach out directly to schedule a short call.',
      '  3. Beta slots are allocated as they open — we will keep you updated.',
      '',
      'In the meantime, you can learn more about Omnis DevOps here:',
      platformUrl,
      '',
      '— The STC Team',
      'Sherwood Technology Consulting',
      CONTACT_EMAIL,
    ].join('\n'),
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
      <body style="margin:0;padding:0;background:#f1f5f9;font-family:Inter,Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
          <tr><td align="center">
            <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

              <!-- Hero -->
              <tr>
                <td style="background:#0F1923;border-radius:12px 12px 0 0;padding:40px 40px 32px;text-align:center;">
                  <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#00D4FF;">STC Products</p>
                  <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;color:#ffffff;">Omnis DevOps</h1>
                  <p style="margin:0;font-size:14px;color:#94a3b8;">Full visibility. Zero complexity. Built for one.</p>
                </td>
              </tr>

              <!-- Divider bar -->
              <tr>
                <td style="background:linear-gradient(90deg,#00D4FF,#009EBF);height:3px;"></td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="background:#ffffff;padding:40px;border-radius:0 0 12px 12px;">
                  <h2 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#0f172a;">Application received, ${name}.</h2>
                  <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.7;">
                    Thank you for applying to the Omnis DevOps beta. We review every application individually — this is not a generic waitlist.
                  </p>
                  <p style="margin:0 0 28px;font-size:15px;color:#334155;line-height:1.7;">
                    We prioritize solo DevOps engineers, technical consultants, agencies, and small teams with active deployment, uptime, and client-reporting pain.
                  </p>

                  <!-- What happens next -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:28px;">
                    <tr><td style="padding:20px 24px;">
                      <p style="margin:0 0 14px;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#00D4FF;">What happens next</p>
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width:28px;padding-bottom:12px;vertical-align:top;">
                            <span style="display:inline-block;width:22px;height:22px;background:#0F1923;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:700;color:#00D4FF;">1</span>
                          </td>
                          <td style="padding-bottom:12px;padding-left:10px;font-size:14px;color:#334155;line-height:1.6;">We review your application for fit.</td>
                        </tr>
                        <tr>
                          <td style="width:28px;padding-bottom:12px;vertical-align:top;">
                            <span style="display:inline-block;width:22px;height:22px;background:#0F1923;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:700;color:#00D4FF;">2</span>
                          </td>
                          <td style="padding-bottom:12px;padding-left:10px;font-size:14px;color:#334155;line-height:1.6;">If you are a strong match, we will reach out directly to schedule a short call.</td>
                        </tr>
                        <tr>
                          <td style="width:28px;vertical-align:top;">
                            <span style="display:inline-block;width:22px;height:22px;background:#0F1923;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:700;color:#00D4FF;">3</span>
                          </td>
                          <td style="padding-left:10px;font-size:14px;color:#334155;line-height:1.6;">Beta slots are allocated as they open — we will keep you updated.</td>
                        </tr>
                      </table>
                    </td></tr>
                  </table>

                  <p style="margin:0 0 24px;font-size:14px;color:#64748b;">In the meantime, you can read more about what Omnis DevOps does on our product page.</p>

                  <p style="margin:0 0 32px;text-align:center;">
                    <a href="${platformUrl}" style="display:inline-block;padding:13px 28px;background:#0F1923;color:#00D4FF;text-decoration:none;border-radius:8px;font-size:14px;font-weight:700;border:1px solid #243044;">View Omnis DevOps &rarr;</a>
                  </p>

                  <!-- Footer -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e2e8f0;padding-top:24px;">
                    <tr>
                      <td style="font-size:13px;color:#94a3b8;line-height:1.6;">
                        <strong style="color:#475569;">Sherwood Technology Consulting</strong><br />
                        Questions? Reply to this email or contact us at
                        <a href="mailto:${CONTACT_EMAIL}" style="color:#00D4FF;text-decoration:none;">${CONTACT_EMAIL}</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            </table>
          </td></tr>
        </table>
      </body>
      </html>
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

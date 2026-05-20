const twilio = require('twilio');

/**
 * Normalize Pakistani / international numbers to E.164 for Twilio.
 * Examples: 03193790030 → +923193790030, +92 319 3790030 → +923193790030
 */
const normalizePhoneToE164 = (phone) => {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return null;

  if (digits.startsWith('92') && digits.length >= 12) {
    return `+${digits}`;
  }
  if (digits.startsWith('0') && digits.length === 11) {
    return `+92${digits.slice(1)}`;
  }
  if (digits.length === 10 && digits.startsWith('3')) {
    return `+92${digits}`;
  }
  if (phone.trim().startsWith('+')) {
    return `+${digits}`;
  }
  return `+${digits}`;
};

const isSmsConfigured = () =>
  Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER &&
      !process.env.TWILIO_ACCOUNT_SID.startsWith('your_')
  );

/** Domain line for Web OTP / Google Messages autofill (use localhost in dev). */
const getOtpWebDomain = () =>
  process.env.OTP_WEB_DOMAIN || process.env.FRONTEND_HOST || 'localhost';

/**
 * SMS body — last line `@domain #code` lets Chrome read OTP from Google Messages.
 */
const buildOtpSmsBody = (code, amount, recipientName) => {
  const domain = getOtpWebDomain();
  return [
    `AskariBank: Your verification code is ${code}`,
    `Transfer Rs ${Number(amount).toLocaleString()} to ${recipientName || 'recipient'}. Valid 5 min.`,
    `@${domain} #${code}`,
  ].join('\n');
};

/**
 * Send transfer OTP via SMS (delivered to Google Messages / default SMS app).
 */
const sendTransferOtpSms = async (toPhone, { code, amount, recipientName }) => {
  const to = normalizePhoneToE164(toPhone);
  if (!to) {
    throw new Error('Invalid phone number. Update your number in Settings.');
  }

  const body = buildOtpSmsBody(code, amount, recipientName);

  if (!isSmsConfigured()) {
    console.warn(`[AskariBank SMS] Twilio not configured. OTP ${code} → ${to}`);
    console.warn(`[AskariBank SMS] Message preview:\n${body}`);
    return { delivered: false, devMode: true, to };
  }

  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  try {
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    console.log(`[AskariBank SMS] OTP sent to ${to} (SID: ${message.sid})`);
    return { delivered: true, sid: message.sid, to };
  } catch (err) {
    const hint =
      err.code === 21608
        ? ' Verify this number in your Twilio console (trial accounts).'
        : '';
    throw new Error((err.message || 'SMS delivery failed') + hint);
  }
};

module.exports = { sendTransferOtpSms, normalizePhoneToE164, isSmsConfigured };

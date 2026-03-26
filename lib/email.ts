import nodemailer from "nodemailer";

type SendOtpEmailPayload = {
  email: string;
  otp: string;
};

const OTP_SUBJECT = "Mã OTP xác thực tài khoản";
const PASSWORD_RESET_OTP_SUBJECT = "Mã OTP đặt lại mật khẩu";

function otpBodies(otp: string) {
  const text = `Mã OTP của bạn là ${otp}. Mã có hiệu lực trong 10 phút.`;
  const html = `<p>Mã OTP của bạn là <strong>${otp}</strong>.</p><p>Mã có hiệu lực trong 10 phút.</p>`;
  return { text, html };
}

function passwordResetOtpBodies(otp: string) {
  const text = `Mã OTP đặt lại mật khẩu của bạn là ${otp}. Mã có hiệu lực trong 10 phút.`;
  const html = `<p>Mã OTP đặt lại mật khẩu là <strong>${otp}</strong>.</p><p>Mã có hiệu lực trong 10 phút.</p>`;
  return { text, html };
}

export async function sendOtpEmail(payload: SendOtpEmailPayload) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const fromEmail = process.env.SMTP_FROM_EMAIL;
  const fromName = process.env.SMTP_FROM_NAME || "CTU GO";

  if (!host || !port || !user || !pass || !fromEmail) {
    throw new Error("SMTP configuration is incomplete");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const { text, html } = otpBodies(payload.otp);

  try {
    await transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to: payload.email,
      subject: OTP_SUBJECT,
      text,
      html,
    });
  } catch (error) {
    const e = error as {
      code?: string;
      responseCode?: number;
      command?: string;
      message?: string;
    };
    console.error("sendOtpEmail SMTP sendMail failed", {
      to: payload.email,
      from: fromEmail,
      host,
      port,
      code: e?.code,
      responseCode: e?.responseCode,
      command: e?.command,
      message: e?.message,
    });
    throw new Error("Gửi email thất bại");
  }
}

export async function sendPasswordResetOtpEmail(payload: SendOtpEmailPayload) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const fromEmail = process.env.SMTP_FROM_EMAIL;
  const fromName = process.env.SMTP_FROM_NAME || "CTU GO";

  if (!host || !port || !user || !pass || !fromEmail) {
    throw new Error("SMTP configuration is incomplete");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const { text, html } = passwordResetOtpBodies(payload.otp);

  try {
    await transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to: payload.email,
      subject: PASSWORD_RESET_OTP_SUBJECT,
      text,
      html,
    });
  } catch (error) {
    const e = error as {
      code?: string;
      responseCode?: number;
      command?: string;
      message?: string;
    };
    console.error("sendPasswordResetOtpEmail SMTP sendMail failed", {
      to: payload.email,
      from: fromEmail,
      host,
      port,
      code: e?.code,
      responseCode: e?.responseCode,
      command: e?.command,
      message: e?.message,
    });
    throw new Error("Gửi email thất bại");
  }
}

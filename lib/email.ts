import nodemailer from "nodemailer";

type SendOtpEmailPayload = {
  email: string;
  otp: string;
};

export async function sendOtpEmail(payload: SendOtpEmailPayload) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const fromEmail = process.env.SMTP_FROM_EMAIL;
  const fromName = process.env.SMTP_FROM_NAME || "CTU GO";
  const subject = "Ma OTP xac thuc tai khoan";

  if (!host || !port || !user || !pass || !fromEmail) {
    throw new Error("SMTP configuration is incomplete");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to: payload.email,
    subject,
    text: `Ma OTP cua ban la ${payload.otp}. Ma co hieu luc trong 10 phut.`,
    html: `<p>Ma OTP cua ban la <strong>${payload.otp}</strong>.</p><p>Ma co hieu luc trong 10 phut.</p>`,
  });
}

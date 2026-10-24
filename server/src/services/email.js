import nodemailer from 'nodemailer'

const SENDER_NAME = 'InterviewAI'
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL

// Brevo issues two different kinds of credential for the same account: a REST
// API key (BREVO_API_KEY, used over HTTPS) and an SMTP key (BREVO_SMTP_KEY,
// used to authenticate to smtp-relay.brevo.com). Either one works here.
const API_KEY = process.env.BREVO_API_KEY
const SMTP_KEY = process.env.BREVO_SMTP_KEY
const SMTP_LOGIN = process.env.BREVO_SMTP_LOGIN || SENDER_EMAIL

const mode = API_KEY ? 'api' : SMTP_KEY ? 'smtp' : 'mock'
export const emailEnabled = mode !== 'mock'

if (mode === 'mock') {
  console.warn('BREVO_API_KEY / BREVO_SMTP_KEY not set — OTP codes will be logged to the console instead of emailed.')
} else if (!SENDER_EMAIL) {
  console.warn('BREVO_SENDER_EMAIL not set — Brevo requires a verified sender email; emails will fail to send.')
}

let smtpTransport = null
function getSmtpTransport() {
  if (!smtpTransport) {
    smtpTransport = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: { user: SMTP_LOGIN, pass: SMTP_KEY },
    })
  }
  return smtpTransport
}

function otpEmailContent(code) {
  return {
    subject: 'Your InterviewAI login code',
    html: `
      <p>Your InterviewAI login code is:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:4px;">${code}</p>
      <p>It expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
    `,
  }
}

export async function sendOtpEmail(toEmail, code) {
  if (mode === 'mock') {
    console.log(`[mock email] InterviewAI login code for ${toEmail}: ${code}`)
    return { mock: true }
  }

  const { subject, html } = otpEmailContent(code)

  if (mode === 'smtp') {
    await getSmtpTransport().sendMail({
      from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
      to: toEmail,
      subject,
      html,
    })
    return { mock: false }
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': API_KEY, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ sender: { name: SENDER_NAME, email: SENDER_EMAIL }, to: [{ email: toEmail }], subject, htmlContent: html }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Brevo rejected the email (${res.status}): ${body.slice(0, 300)}`)
  }
  return { mock: false }
}

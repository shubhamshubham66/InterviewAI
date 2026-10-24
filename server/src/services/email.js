const BREVO_API_KEY = process.env.BREVO_API_KEY
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL
const SENDER_NAME = 'InterviewAI'

export const emailEnabled = Boolean(BREVO_API_KEY && SENDER_EMAIL)

if (!emailEnabled) {
  console.warn('BREVO_API_KEY / BREVO_SENDER_EMAIL not set — OTP codes will be logged to the console instead of emailed.')
}

export async function sendOtpEmail(toEmail, code) {
  if (!emailEnabled) {
    console.log(`[mock email] InterviewAI login code for ${toEmail}: ${code}`)
    return { mock: true }
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: toEmail }],
      subject: 'Your InterviewAI login code',
      htmlContent: `
        <p>Your InterviewAI login code is:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:4px;">${code}</p>
        <p>It expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
      `,
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Brevo rejected the email (${res.status}): ${body.slice(0, 300)}`)
  }
  return { mock: false }
}

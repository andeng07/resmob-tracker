import nodemailer from "nodemailer";
import { GMAIL_USER, GMAIL_APP_PASSWORD } from "$env/static/private";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

export async function sendOTP(email: string, code: string): Promise<void> {
  try {
    console.log("Sending OTP email...", { to: email });

    const mailOptions = {
      from: `Dear Amanah <${GMAIL_USER}>`,
      to: email,
      subject: "Your Verification Code",
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body {
            margin: 0;
            padding: 0;
            background: #f3f4f6;
            font-family: 'Segoe UI', Tahoma, sans-serif;
            color: #111827;
          }

          .wrapper {
            width: 100%;
            padding: 24px 12px;
            box-sizing: border-box;
          }

          .container {
            max-width: 560px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 14px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          }

          .header {
            background: linear-gradient(135deg, #006d3b, #004d28);
            padding: 24px;
            text-align: center;
            color: white;
          }

          .header h1 {
            margin: 0;
            font-size: 20px;
            letter-spacing: 0.5px;
          }

          .content {
            padding: 32px 28px;
            text-align: center;
          }

          .title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 10px;
          }

          .subtitle {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 26px;
            line-height: 1.5;
          }

          .otp-box {
            display: inline-block;
            background: #ecfdf5;
            border: 1px solid #a7f3d0;
            color: #047857;
            font-size: 28px;
            letter-spacing: 10px;
            font-weight: 700;
            padding: 14px 22px;
            border-radius: 10px;
            margin: 18px 0 24px;
          }

          .warning {
            font-size: 13px;
            color: #92400e;
            background: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 12px 14px;
            border-radius: 8px;
            text-align: left;
            margin-top: 20px;
          }

          .footer {
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
            padding: 18px;
            background: #f9fafb;
            border-top: 1px solid #e5e7eb;
          }

          /* Mobile responsiveness */
          @media screen and (max-width: 480px) {
            .content {
              padding: 24px 18px;
            }

            .otp-box {
              font-size: 24px;
              letter-spacing: 6px;
              padding: 12px 16px;
            }
          }
        </style>
      </head>

      <body>
        <div class="wrapper">
          <div class="container">

            <!-- Header -->
            <div class="header">
              <h1>Dear Amanah</h1>
            </div>

            <!-- Content -->
            <div class="content">
              <div class="title">Verify your login</div>

              <div class="subtitle">
                Use the verification code below to continue. This code is valid for <b>5 minutes</b>.
              </div>

              <div class="otp-box">${code}</div>

              <div class="warning">
                <b>Security note:</b> If you didn’t request this code, you can safely ignore this email.
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              © ${new Date().getFullYear()} Dear Amanah
            </div>

          </div>
        </div>
      </body>
      </html>
      `,
    };

    const result = await transporter.sendMail(mailOptions);

    console.log("OTP email sent:", {
      messageId: result.messageId,
      to: email,
    });
  } catch (err) {
    console.error("Failed to send OTP email:", { email, err });
    throw err;
  }
}

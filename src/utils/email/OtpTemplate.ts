interface OtpEmailTemplateProps {
    userName: string
    otp: string
    platformName?: string
}

export function OtpEmailTemplate({
    userName,
    otp,
    platformName = 'Vilora Tech Education',
}: OtpEmailTemplateProps): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>OTP Verification</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #e5e5e5;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">
                Verify Your Account
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.5; color: #4a4a4a;">
                Hi <strong>${userName}</strong>,
              </p>

              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.5; color: #4a4a4a;">
                Use the following One Time Password to complete your verification. This OTP is valid for a limited time.
              </p>

              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8f9fa; border-radius: 6px; border: 1px solid #e5e5e5;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                      Your OTP Code
                    </p>
                    <p style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #1a1a1a; font-family: 'Courier New', monospace;">
                      ${otp}
                    </p>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 24px; padding: 16px; background-color: #fef3c7; border-left: 3px solid #f59e0b; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #92400e;">
                  <strong>Security Notice:</strong> Do not share this OTP with anyone. Our team will never ask for it.
                </p>
              </div>

              <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.5; color: #6b7280;">
                If you did not request this verification, please ignore this email or contact support immediately.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 40px; text-align: center; border-top: 1px solid #e5e5e5; background-color: #f8f9fa;">
              <p style="margin: 0; font-size: 13px; color: #6b7280;">
                © 2025 ${platformName}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

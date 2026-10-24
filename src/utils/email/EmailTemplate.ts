interface EmailTemplateProps {
    userName: string
    email: string
    password: string | undefined
    platformName?: string
}

export function EmailTemplate({
    email,
    userName,
    password,
    platformName = 'Vilora Tech Education',
}: EmailTemplateProps): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login Credentials</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #e5e5e5;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">
                Welcome to ${platformName}
              </h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.5; color: #4a4a4a;">
                Your account has been created successfully. Below are your login credentials:
              </p>
              
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8f9fa; border-radius: 6px; border: 1px solid #e5e5e5;">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                            Email
                          </p>
                          <p style="margin: 4px 0 0; font-size: 16px; font-weight: 500; color: #1a1a1a;">
                            ${email}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                            userName
                          </p>
                          <p style="margin: 4px 0 0; font-size: 16px; font-weight: 500; color: #1a1a1a;">
                            ${userName}
                          </p>
                        </td>
                      </tr>
                      <tr>
                       <td style="padding: 16px 0 8px;">
  <p style="margin: 0; font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
    Your Login Password
  </p>
  <p style="margin: 6px 0 0; font-size: 18px; font-weight: 700; color: #111827; font-family: 'Courier New', monospace;">
    <strong>${password}</strong>
  </p>
  <p style="margin: 6px 0 0; font-size: 12px; color: #6b7280;">
    Please use this password to sign in.
  </p>
</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <div style="margin-top: 24px; padding: 16px; background-color: #fef3c7; border-left: 3px solid #f59e0b; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #92400e;">
                  <strong>Security Tip:</strong> Please change your password after your first login for security purposes.
                </p>
              </div>
              
              <table role="presentation" style="margin: 32px 0 0; width: 100%;">
                <tr>
                  <td style="text-align: center;">
                    <a href="https://exams.viloratecheducation.com/admin" style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500;">
                      Login to Your Account
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.5; color: #6b7280;">
                If you have any questions or need assistance, please contact our support team.
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

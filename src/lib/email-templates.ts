export function welcomeEmail(userName: string | null): string {
  const name = userName || "there";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to The Hous</title>
</head>
<body style="margin: 0; padding: 0; background-color: #080808; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #080808;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; width: 100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <img src="https://housofthedarlingstarling.com/logo.png" alt="Hous of The Darling Starling" width="72" height="72" style="display: block; border: 0;" />
            </td>
          </tr>

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 8px;">
              <h1 style="margin: 0; font-family: 'Georgia', 'Times New Roman', serif; font-size: 28px; font-weight: 300; color: #f5f0e8; letter-spacing: 1px;">
                Welcome to The Hous
              </h1>
            </td>
          </tr>

          <!-- Ornament -->
          <tr>
            <td align="center" style="padding: 16px 0 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width: 48px; height: 1px; background: linear-gradient(to right, transparent, #8b7535);"></td>
                  <td style="padding: 0 12px; color: #8b7535; font-size: 10px;">&#10022;</td>
                  <td style="width: 48px; height: 1px; background: linear-gradient(to left, transparent, #8b7535);"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Card -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #141414; border: 1px solid #222222; border-radius: 8px;">
                <tr>
                  <td style="padding: 36px 32px;">
                    <p style="margin: 0 0 20px; color: #e8dcc8; font-size: 16px; line-height: 1.6;">
                      Dear ${name},
                    </p>
                    <p style="margin: 0 0 20px; color: #9a9080; font-size: 15px; line-height: 1.7;">
                      Your access to the Hous of The Darling Starling has been approved. You are now cleared to enter the private portal.
                    </p>
                    <p style="margin: 0 0 28px; color: #9a9080; font-size: 15px; line-height: 1.7;">
                      The Hous is a living creative universe — still being built, still being shaped. As an approved member, you have a seat inside while the walls go up. What you see is early. What comes next will be worth the wait.
                    </p>

                    <!-- CTA Button -->
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                      <tr>
                        <td align="center" style="border: 1px solid rgba(201, 168, 76, 0.3); border-radius: 4px;">
                          <a href="https://housofthedarlingstarling.com/login" target="_blank"
                             style="display: inline-block; padding: 14px 36px; color: #c9a84c; font-size: 12px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; text-decoration: none;">
                            Enter The Hous
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px;">
              <p style="margin: 0 0 6px; color: #9a908060; font-size: 12px; font-family: 'Georgia', 'Times New Roman', serif;">
                Hous of The Darling Starling LLC
              </p>
              <p style="margin: 0 0 16px; color: #9a908040; font-size: 11px;">
                housofthedarlingstarling.com
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="https://housofthedarlingstarling.com/privacy" style="color: #9a908040; font-size: 10px; text-decoration: none;">Privacy</a>
                  </td>
                  <td style="color: #9a908030; font-size: 10px;">|</td>
                  <td style="padding: 0 8px;">
                    <a href="https://housofthedarlingstarling.com/terms" style="color: #9a908040; font-size: 10px; text-decoration: none;">Terms</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

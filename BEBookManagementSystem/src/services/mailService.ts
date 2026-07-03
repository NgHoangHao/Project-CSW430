import nodemailer from 'nodemailer';
import dotenv from 'dotenv'

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const mailService = {
  sendOtp: async (to: string, otp: string) => {
    try {
      // Giao diện HTML cho Email OTP
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Xác thực OTP - Book Store HHK</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f6f9fc; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" id="email-container" style="max-width: 500px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #eef2f5;">
                  
                  <tr>
                    <td align="center" style="padding: 32px 40px 20px 40px; border-bottom: 1px solid #f0f4f8;">
                      <h2 style="margin: 0; color: #1a1a1a; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                        Book Store <span style="color: #3b82f6;">HHK</span>
                      </h2>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 40px 40px 32px 40px;">
                      <h3 style="margin: 0 0 16px 0; color: #1d2939; font-size: 20px; font-weight: 600;">
                        Mã xác thực OTP của bạn
                      </h3>
                      <p style="margin: 0 0 24px 0; color: #4d5765; font-size: 15px; line-height: 24px;">
                        Chào bạn, bạn vừa yêu cầu mã xác thực để truy cập vào hệ thống của <strong>Book Store HHK</strong>. Vui lòng sử dụng mã OTP dưới đây để hoàn tất quá trình:
                      </p>
                      
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                        <tr>
                          <td align="center" style="background-color: #f0f7ff; border: 1px dashed #3b82f6; border-radius: 6px; padding: 16px;">
                            <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #1d4ed8;">
                              ${otp}
                            </span>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 0; color: #ef4444; font-size: 13px; font-weight: 500; display: flex; align-items: center; justify-content: center;">
                        ⚠️ Mã này có hiệu lực trong vòng 5 phút và chỉ sử dụng được 1 lần.
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td align="center" style="padding: 0 40px 40px 40px;">
                      <p style="margin: 0 0 8px 0; color: #98a2b3; font-size: 13px;">
                        Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này an toàn.
                      </p>
                      <p style="margin: 0; color: #98a2b3; font-size: 12px; border-top: 1px solid #f0f4f8; padding-top: 16px; width: 100%;">
                        © ${new Date().getFullYear()} Book Store HHK. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: '"Book Store HHK" <no-reply@myapp.com>',
        to,
        subject: '🔒 Mã xác thực OTP - Book Store HHK',
        text: `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn sau 5 phút.`, // Vẫn giữ text phòng hờ các thiết bị cũ không render được HTML
        html: emailHtml, // Giao diện HTML mới
      });

      console.log(`OTP sent to ${to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send OTP');
    }
  }
};
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
  },

  sendOverdueNotice: async (
    to: string,
    userName: string,
    bookTitle: string,
    dueDate: string,
    barcode: string
  ) => {
    try {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thông báo sách mượn quá hạn</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f6f9fc; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); border: 1px solid #fee2e2;">
                  
                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding: 28px 40px; background-color: #fef2f2; border-bottom: 1px solid #fee2e2;">
                      <h2 style="margin: 0; color: #dc2626; font-size: 22px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        ⚠️ THÔNG BÁO MƯỢN SÁCH QUÁ HẠN
                      </h2>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 32px 40px;">
                      <p style="margin: 0 0 16px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                        Xin chào <strong>${userName}</strong>,
                      </p>
                      <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 15px; line-height: 24px;">
                        Hệ thống nhận thấy bạn có một hoặc nhiều cuốn sách mượn tại <strong>Book Store HHK</strong> đã quá hạn trả. Vui lòng kiểm tra thông tin dưới đây:
                      </p>

                      <!-- Book Info Card -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 24px; padding: 16px;">
                        <tr>
                          <td style="padding-bottom: 8px;">
                            <span style="color: #6b7280; font-size: 13px;">Tên sách:</span><br>
                            <strong style="color: #111827; font-size: 15px;">${bookTitle}</strong>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-bottom: 8px;">
                            <span style="color: #6b7280; font-size: 13px;">Mã vạch bản sao:</span><br>
                            <strong style="color: #1d4ed8; font-size: 14px; font-family: monospace;">${barcode}</strong>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <span style="color: #6b7280; font-size: 13px;">Hạn trả quy định:</span><br>
                            <strong style="color: #dc2626; font-size: 15px;">${dueDate}</strong>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 14px; line-height: 22px;">
                        👉 Vui lòng nhanh chóng mang sách đến thư viện để trả hoặc liên hệ thủ thư để được trợ giúp. Trả sách quá hạn có thể ảnh hưởng đến điểm tín nhiệm của bạn.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td align="center" style="padding: 0 40px 32px 40px; border-top: 1px solid #f3f4f6; padding-top: 20px;">
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        © ${new Date().getFullYear()} Book Store HHK. Email tự động, vui lòng không phản hồi trực tiếp.
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
        from: '"Book Store HHK" <' + (process.env.EMAIL_USER || 'no-reply@myapp.com') + '>',
        to,
        subject: `⚠️ [CẢNH BÁO QUÁ HẠN] Sách "${bookTitle}" đã quá hạn trả!`,
        text: `Xin chào ${userName}, cuốn sách "${bookTitle}" (Mã: ${barcode}) đã quá hạn trả (${dueDate}). Vui lòng mang sách trả lại thư viện.`,
        html: emailHtml,
      });

      console.log(`Overdue notice email sent to ${to} for book "${bookTitle}"`);
      return true;
    } catch (error) {
      console.error('Error sending overdue notice email:', error);
      throw new Error((error as any)?.message || 'Failed to send overdue email notice');
    }
  }
};
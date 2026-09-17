import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { orgId, eventId, eventName, fullName, phone, email, parish, address, organizerEmail } = data;

    // Use provided env vars or default to a dummy log mechanism if not configured
    const user = process.env.SMTP_EMAIL || '';
    const pass = process.env.SMTP_PASSWORD || '';
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 465;

    // Build the email HTML content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background: #0f766e; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Đăng Ký Sự Kiện Mới</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Hệ thống Website Giới trẻ Giáo phận Bà Rịa</p>
        </div>
        <div style="padding: 20px; background: #f8fafc;">
          <h3 style="color: #334155; margin-top: 0; border-bottom: 2px solid #cbd5e1; padding-bottom: 10px;">Thông tin Sự kiện</h3>
          <p><strong>Tên sự kiện:</strong> ${eventName || eventId}</p>
          
          <h3 style="color: #334155; border-bottom: 2px solid #cbd5e1; padding-bottom: 10px; margin-top: 25px;">Thông tin Người Đăng ký</h3>
          <ul style="list-style: none; padding: 0; color: #1e293b; line-height: 1.8;">
            <li><strong>Họ và tên:</strong> ${fullName}</li>
            <li><strong>Số điện thoại:</strong> ${phone}</li>
            <li><strong>Email:</strong> ${email || 'Không cung cấp'}</li>
            <li><strong>Giáo xứ:</strong> ${parish}</li>
            <li><strong>Địa chỉ:</strong> ${address || 'Không cung cấp'}</li>
          </ul>
        </div>
        <div style="background: #f1f5f9; color: #64748b; padding: 15px; text-align: center; font-size: 0.85rem;">
          Email này được tạo tự động từ hệ thống form đăng ký sự kiện. Vui lòng không trả lời trực tiếp email này.
        </div>
      </div>
    `;

    if (!user || !pass) {
      console.log('--- MÔ PHỎNG GỬI EMAIL THÀNH CÔNG (Chưa cấu hình SMTP) ---');
      console.log('To:', organizerEmail);
      console.log('Subject:', `[Đăng Ký Mới] ${eventName || eventId}`);
      console.log('HTML Body (Length):', htmlContent.length);
      console.log('---------------------------------------------------------');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return NextResponse.json({ success: true, message: 'Simulated email sent' });
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });

    const info = await transporter.sendMail({
      from: `"Website Hệ Thống" <${user}>`, // sender address
      to: organizerEmail, // receiver
      subject: `[Đăng Ký Mới] ${fullName} - ${eventName || eventId}`, // Subject line
      html: htmlContent, // html body
    });

    console.log("Message sent: %s", info.messageId);
    return NextResponse.json({ success: true, message: 'Email sent successfully', messageId: info.messageId });

  } catch (error: any) {
    console.error('Lỗi khi gửi email:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

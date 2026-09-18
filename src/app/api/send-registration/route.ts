import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabase } from '../../utils/supabaseClient';
import { z } from 'zod';

const registrationSchema = z.object({
  orgId: z.any().optional(),
  eventId: z.any().optional(),
  eventName: z.any().optional(),
  fullName: z.string().min(2, 'Họ tên không hợp lệ').max(100, 'Họ tên không hợp lệ'),
  phone: z.string().regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  parish: z.any().optional(),
  address: z.any().optional(),
  organizerEmail: z.any().optional(),
});

export async function POST(request: Request) {
  const logs: string[] = [];
  const log = (msg: string) => { console.log(msg); logs.push(msg); };

  try {
    const data = await request.json();

    const result = registrationSchema.safeParse(data);
    if (!result.success) {
      return NextResponse.json({ success: false, error: (result.error as any).errors[0].message, logs }, { status: 400 });
    }

    const { orgId, eventId, eventName, fullName, phone, email, parish, address, organizerEmail } = result.data;
    log(`[1/5] Received registration: ${fullName} for ${eventName}`);
    log(`[1/5] organizerEmail from frontend: "${organizerEmail}"`);

    // Lưu vào database
    const { error: dbError } = await supabase.from('event_registrations').insert({
      event_id: eventId,
      event_name: eventName,
      org_id: orgId,
      full_name: fullName,
      phone,
      email,
      parish,
      address
    });

    if (dbError) {
      log(`[2/5] ❌ DB insert failed: ${dbError.message}`);
    } else {
      log(`[2/5] ✅ DB insert success`);
    }

    // SMTP config
    const user = process.env.SMTP_EMAIL || '';
    const pass = process.env.SMTP_PASSWORD || '';
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 465;

    log(`[3/5] SMTP config: host=${host}, port=${port}, user=${user ? user.substring(0, 5) + '***' : 'EMPTY'}, pass=${pass ? '***SET***' : 'EMPTY'}`);

    if (!user || !pass) {
      log(`[3/5] ❌ SMTP credentials missing! Simulating email.`);
      await new Promise(resolve => setTimeout(resolve, 500));
      return NextResponse.json({ success: true, message: 'Simulated (no SMTP creds)', logs });
    }

    // Build email HTML
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

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    // Verify SMTP connection
    try {
      await transporter.verify();
      log(`[4/5] ✅ SMTP connection verified`);
    } catch (verifyErr: any) {
      log(`[4/5] ❌ SMTP verify failed: ${verifyErr.message}`);
      return NextResponse.json({ success: false, error: `SMTP connection failed: ${verifyErr.message}`, logs }, { status: 500 });
    }

    const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    const toEmail = (organizerEmail && isValidEmail(organizerEmail)) ? organizerEmail : user;
    const ccEmail = (email && isValidEmail(email)) ? email : undefined;

    log(`[5/5] Sending email: to=${toEmail}, cc=${ccEmail || 'none'}, bcc=${user}`);

    const info = await transporter.sendMail({
      from: `"Website Giới Trẻ GP Bà Rịa" <${user}>`,
      to: toEmail,
      cc: ccEmail,
      bcc: user,
      subject: `[Đăng Ký Mới] ${fullName} - ${eventName || eventId}`,
      html: htmlContent,
    });

    log(`[5/5] ✅ Email sent! messageId: ${info.messageId}`);
    return NextResponse.json({ success: true, message: 'Email sent successfully', messageId: info.messageId, logs });

  } catch (error: any) {
    log(`❌ FATAL ERROR: ${error.message}`);
    // Don't log full error object to avoid leaking PII
    console.error('Lỗi khi gửi email đăng ký:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ success: false, error: error.message, logs }, { status: 500 });
  }
}

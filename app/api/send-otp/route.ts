import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, createOTPEmailHTML } from '@/src/utils/email';

export async function POST(request: NextRequest) {
  try {
    const { email, otp, type } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Send email
    const emailSent = await sendEmail({
      to: email,
      subject: type === 'reset' 
        ? 'Reset Your StockMaster Password' 
        : 'Your StockMaster Verification Code',
      html: createOTPEmailHTML(otp),
    });

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully',
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to send email. Check console for OTP.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

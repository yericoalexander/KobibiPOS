import { NextResponse } from 'next/server';

// Email feature temporarily disabled - nodemailer removed for deployment
export async function POST(req: Request) {
  return NextResponse.json({ 
    error: 'Email feature is currently disabled. Please configure nodemailer to enable this feature.' 
  }, { status: 503 });
}

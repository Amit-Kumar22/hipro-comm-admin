import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ verificationId: string }> }
) {
  try {
    const { verificationId } = await params;
    const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';
    
    // Get request body for rejection reason
    const body = await request.json();
    
    // Prepare headers to forward authentication
    const forwardHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Forward cookies for admin authentication
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      forwardHeaders['cookie'] = cookieHeader;
    }
    
    // Forward authorization header if present
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      forwardHeaders['authorization'] = authHeader;
    }
    
    const backendUrl = `${API_BASE_URL}/api/v1/admin/payment-verifications/${verificationId}/reject`;
    console.log('Rejecting payment verification:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: forwardHeaders,
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('Reject payment verification error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
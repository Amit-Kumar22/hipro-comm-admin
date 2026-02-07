import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the backend API URL from environment variables
    const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';
    
    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
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
    
    const backendUrl = `${API_BASE_URL}/api/v1/admin/payment-verifications${queryString ? `?${queryString}` : ''}`;
    console.log('Fetching payment verifications from:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: forwardHeaders
    });

    if (!response.ok) {
      console.error('Backend response not ok:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      
      return NextResponse.json({
        success: false,
        message: `Backend error: ${response.status} ${response.statusText}`,
        error: errorText
      }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Payment verifications API proxy error:', error);
    
    if (error instanceof Error && (
      error.message.includes('ECONNREFUSED') || 
      error.message.includes('fetch failed') ||
      error.message.includes('Failed to fetch')
    )) {
      return NextResponse.json({
        success: false,
        message: 'Cannot connect to backend API. Please ensure the backend server is running.',
        error: 'BACKEND_UNREACHABLE'
      }, { status: 503 });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
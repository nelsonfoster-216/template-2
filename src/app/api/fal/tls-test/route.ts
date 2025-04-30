import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const tlsEnabled = process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0';
  
  const testResult = {
    tlsVerificationEnabled: tlsEnabled,
    nodeEnvironment: process.env.NODE_ENV,
    nodeOptions: process.env.NODE_OPTIONS || 'Not set',
    canDisableTls: true,
  };
  
  // Test if we can actually modify the TLS setting
  try {
    // Save the original value
    const originalValue = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    
    // Try to temporarily disable TLS verification
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    // Check if it worked
    testResult.canDisableTls = process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0';
    
    // Restore the original value
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = originalValue;
  } catch (error) {
    testResult.canDisableTls = false;
  }
  
  // Try to access a site with TLS verification disabled
  let canConnectWithoutTls = false;
  
  try {
    // Temporarily disable TLS verification
    const originalValue = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    // Try the request with direct IP
    const response = await fetch('https://104.18.6.192/health', {
      method: 'HEAD',
      headers: {
        'Host': 'gateway.fal.ai'
      }
    });
    
    canConnectWithoutTls = response.ok;
    
    // Restore the original value
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = originalValue;
  } catch (error) {
    canConnectWithoutTls = false;
  }
  
  return NextResponse.json({
    ...testResult,
    canConnectWithoutTls,
    message: canConnectWithoutTls 
      ? "TLS verification can be disabled and works" 
      : "TLS verification issues persist even when disabled"
  });
} 
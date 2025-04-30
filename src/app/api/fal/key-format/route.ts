import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  let apiKey = process.env.FAL_KEY;
  
  // Initialize analysis object
  const analysis = {
    keyPresent: !!apiKey,
    originalLength: apiKey?.length || 0,
    containsQuotes: false,
    hasKeyPrefix: false,
    hasExtraSpaces: false,
    formattedKey: "",
    suggestion: ""
  };
  
  if (apiKey) {
    // Check if it contains quotes
    analysis.containsQuotes = /^['"]|['"]$/.test(apiKey);
    
    // Check if it has the "Key " prefix
    analysis.hasKeyPrefix = apiKey.trim().startsWith('Key ');
    
    // Check if it has extra spaces
    analysis.hasExtraSpaces = apiKey !== apiKey.trim();
    
    // Create a formatted version (but don't log the actual key)
    const formattedKey = apiKey.trim().replace(/^['"]|['"]$/g, '');
    const withPrefix = formattedKey.startsWith('Key ') 
      ? formattedKey 
      : `Key ${formattedKey}`;
    
    // Only store length and prefix info for security
    analysis.formattedKey = `[Properly formatted key with ${withPrefix.length} characters, starts with: ${withPrefix.substring(0, 8)}...]`;
    
    // Generate a suggestion for fixing it in AWS Amplify
    let suggestion = "The FAL_KEY environment variable ";
    if (analysis.containsQuotes || analysis.hasExtraSpaces || !analysis.hasKeyPrefix) {
      suggestion += "should be updated to fix the following issues:\n";
      
      if (analysis.containsQuotes) 
        suggestion += "- Remove the quotes surrounding the key\n";
      
      if (analysis.hasExtraSpaces) 
        suggestion += "- Remove extra spaces at the beginning or end\n";
      
      if (!analysis.hasKeyPrefix) 
        suggestion += "- Add the 'Key ' prefix (if not already in the key)\n";
      
      suggestion += "\nIn the AWS Amplify Console, go to Environment Variables and update the FAL_KEY value.";
    } else {
      suggestion = "The FAL_KEY appears to be correctly formatted.";
    }
    
    analysis.suggestion = suggestion;
  } else {
    analysis.suggestion = "The FAL_KEY environment variable is not set. Please add it in the AWS Amplify Console under Environment Variables.";
  }
  
  return NextResponse.json(analysis);
} 
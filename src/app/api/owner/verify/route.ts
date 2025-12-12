import { NextRequest, NextResponse } from 'next/server';
import { promises as dns } from 'dns';
import { siteStorage } from '@/lib/api-storage';

// Helper function to verify DNS TXT record
async function verifyDNSTXT(domain: string, expectedToken: string): Promise<{ success: boolean; details: string }> {
  const txtHostname = `_scrapesafe.${domain}`;
  
  try {
    const txtRecords = await dns.resolveTxt(txtHostname);
    const allValues = txtRecords.flat().join('');

    // Check if the token is in any of the TXT records
    // Some DNS providers may add quotes, so we normalize both
    const normalizedToken = expectedToken.trim();
    const normalizedValues = allValues.replace(/"/g, '').trim();
    const found = normalizedValues === normalizedToken || normalizedValues.includes(normalizedToken);

    if (found) {
      return {
        success: true,
        details: `Found valid token in TXT record at ${txtHostname}`
      };
    } else {
      return {
        success: false,
        details: `Token not found in TXT record at ${txtHostname}. Found: ${allValues || 'no records'}, Expected: ${normalizedToken}`
      };
    }
  } catch (error: any) {
    if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
      return {
        success: false,
        details: `No TXT record found at ${txtHostname}. Please ensure the DNS record is added and propagated.`
      };
    }
    throw error;
  }
}

// Helper function to verify meta tag (would need to fetch HTML)
async function verifyMetaTag(domain: string, expectedToken: string): Promise<{ success: boolean; details: string }> {
  try {
    const protocol = domain.includes('localhost') ? 'http' : 'https';
    const url = `${protocol}://${domain}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'ScrapeSafe-Verification/1.0'
      },
      // Add timeout
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      return {
        success: false,
        details: `Failed to fetch ${url}: ${response.status} ${response.statusText}`
      };
    }

    const html = await response.text();
    const metaTagRegex = /<meta\s+name=["']scrapesafe["']\s+content=["']([^"']+)["']/i;
    const match = html.match(metaTagRegex);

    if (match && match[1] === expectedToken) {
      return {
        success: true,
        details: `Found valid meta tag in HTML head`
      };
    } else {
      return {
        success: false,
        details: `Meta tag not found or token mismatch. Expected: ${expectedToken}`
      };
    }
  } catch (error: any) {
    return {
      success: false,
      details: `Failed to verify meta tag: ${error.message}`
    };
  }
}

// Helper function to verify file
async function verifyFile(domain: string, expectedToken: string): Promise<{ success: boolean; details: string }> {
  try {
    const protocol = domain.includes('localhost') ? 'http' : 'https';
    const url = `${protocol}://${domain}/.well-known/scrapesafe.json`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'ScrapeSafe-Verification/1.0'
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      return {
        success: false,
        details: `Failed to fetch ${url}: ${response.status} ${response.statusText}`
      };
    }

    const json = await response.json();
    if (json.verification === expectedToken) {
      return {
        success: true,
        details: `Found valid verification file at /.well-known/scrapesafe.json`
      };
    } else {
      return {
        success: false,
        details: `Token mismatch in verification file. Expected: ${expectedToken}`
      };
    }
  } catch (error: any) {
    return {
      success: false,
      details: `Failed to verify file: ${error.message}`
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { siteId, method = 'dns' } = body;

    // Validate input
    if (!siteId || typeof siteId !== 'number') {
      return NextResponse.json(
        { error: 'siteId is required and must be a number' },
        { status: 400 }
      );
    }

    if (!['dns', 'metaTag', 'file'].includes(method)) {
      return NextResponse.json(
        { error: 'method must be one of: dns, metaTag, file' },
        { status: 400 }
      );
    }

    // Get registration from shared storage
    const registration = siteStorage.get(siteId);
    
    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found. Please register the domain first.' },
        { status: 404 }
      );
    }

    let verificationResult;

    switch (method) {
      case 'dns':
        verificationResult = await verifyDNSTXT(registration.domain, registration.verificationToken);
        break;
      case 'metaTag':
        verificationResult = await verifyMetaTag(registration.domain, registration.verificationToken);
        break;
      case 'file':
        verificationResult = await verifyFile(registration.domain, registration.verificationToken);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid verification method' },
          { status: 400 }
        );
    }

    if (verificationResult.success) {
      // Mark as verified
      siteStorage.update(siteId, { verified: true });

      return NextResponse.json({
        ok: true,
        details: verificationResult.details,
        storyIpId: `story:local:${siteId}`, // Mock Story Protocol IP ID
        storySimulated: true
      });
    } else {
      return NextResponse.json({
        ok: false,
        error: verificationResult.details
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { 
        ok: false,
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { siteStorage } from '@/lib/api-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain, ownerWallet } = body;

    // Validate input
    if (!domain || typeof domain !== 'string') {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    if (!ownerWallet || typeof ownerWallet !== 'string') {
      return NextResponse.json(
        { error: 'ownerWallet is required' },
        { status: 400 }
      );
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    if (!domainRegex.test(domain)) {
      return NextResponse.json(
        { error: 'Invalid domain format' },
        { status: 400 }
      );
    }

    // Validate wallet address format (basic check)
    if (!/^0x[a-fA-F0-9]{40}$/.test(ownerWallet)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Check if domain is already registered
    const existing = siteStorage.findByDomain(domain);
    if (existing && !existing.verified) {
      // Return existing registration
      return NextResponse.json({
        siteId: existing.siteId,
        domain: existing.domain,
        ownerWallet: existing.ownerWallet,
        verificationToken: existing.verificationToken,
        verificationMethods: {
          dns: {
            record: `_scrapesafe.${domain}`,
            type: 'TXT',
            value: existing.verificationToken,
            instructions: `Add a TXT record with name "_scrapesafe" and value "${existing.verificationToken}"`
          },
          metaTag: {
            tag: `<meta name="scrapesafe" content="${existing.verificationToken}">`,
            location: 'HTML <head> section',
            instructions: `Add this meta tag to your website's HTML <head> section`
          },
          file: {
            path: `/.well-known/scrapesafe.json`,
            content: JSON.stringify({ verification: existing.verificationToken }, null, 2),
            instructions: `Create a file at /.well-known/scrapesafe.json with the verification token`
          }
        }
      });
    }

    // Generate verification token
    const verificationToken = `scrapesafe-${randomUUID()}`;

    // Create new registration
    const registration = siteStorage.create(domain, ownerWallet, verificationToken);

    return NextResponse.json({
      siteId: registration.siteId,
      domain: registration.domain,
      ownerWallet: registration.ownerWallet,
      verificationToken,
      verificationMethods: {
        dns: {
          record: `_scrapesafe.${domain}`,
          type: 'TXT',
          value: verificationToken,
          instructions: `Add a TXT record with name "_scrapesafe" and value "${verificationToken}"`
        },
        metaTag: {
          tag: `<meta name="scrapesafe" content="${verificationToken}">`,
          location: 'HTML <head> section',
          instructions: `Add this meta tag to your website's HTML <head> section`
        },
        file: {
          path: `/.well-known/scrapesafe.json`,
          content: JSON.stringify({ verification: verificationToken }, null, 2),
          instructions: `Create a file at /.well-known/scrapesafe.json with the verification token`
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve registration details
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const siteId = searchParams.get('siteId');

  if (!siteId) {
    return NextResponse.json(
      { error: 'siteId is required' },
      { status: 400 }
    );
  }

  const registration = siteStorage.get(Number(siteId));
  if (!registration) {
    return NextResponse.json(
      { error: 'Registration not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    siteId: registration.siteId,
    domain: registration.domain,
    ownerWallet: registration.ownerWallet,
    verificationToken: registration.verificationToken,
    verified: registration.verified,
    createdAt: registration.createdAt.toISOString()
  });
}


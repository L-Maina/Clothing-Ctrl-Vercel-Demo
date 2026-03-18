import { NextResponse } from 'next/server';

// API to extract image URL from Instagram post URL
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const instagramUrl = searchParams.get('url');

  if (!instagramUrl) {
    return NextResponse.json({ error: 'URL parameter required' }, { status: 400 });
  }

  try {
    // Validate Instagram URL
    const url = new URL(instagramUrl);
    if (!url.hostname.includes('instagram.com')) {
      return NextResponse.json({ error: 'Not a valid Instagram URL' }, { status: 400 });
    }

    // Fetch the Instagram page
    const response = await fetch(instagramUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch Instagram page' }, { status: 500 });
    }

    const html = await response.text();

    // Try to extract image URL from meta tags
    const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
    if (ogImageMatch && ogImageMatch[1]) {
      return NextResponse.json({ imageUrl: ogImageMatch[1] });
    }

    // Try alternate format
    const twitterImageMatch = html.match(/<meta[^>]*name="twitter:image"[^>]*content="([^"]+)"/i);
    if (twitterImageMatch && twitterImageMatch[1]) {
      return NextResponse.json({ imageUrl: twitterImageMatch[1] });
    }

    // Try to find image in JSON-LD or other embedded data
    const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
    if (jsonLdMatch) {
      try {
        const jsonLd = JSON.parse(jsonLdMatch[1]);
        if (jsonLd.image) {
          const imageUrl = Array.isArray(jsonLd.image) ? jsonLd.image[0] : jsonLd.image;
          if (typeof imageUrl === 'string') {
            return NextResponse.json({ imageUrl });
          }
          if (imageUrl.url) {
            return NextResponse.json({ imageUrl: imageUrl.url });
          }
        }
      } catch {
        // JSON parsing failed, continue
      }
    }

    return NextResponse.json({ 
      error: 'Could not extract image from Instagram post. Please use a direct image URL instead.',
      hint: 'Right-click on the image and select "Copy Image Address"'
    }, { status: 404 });

  } catch (error) {
    console.error('Instagram image extraction error:', error);
    return NextResponse.json({ 
      error: 'Failed to process Instagram URL',
      hint: 'Please try using a direct image URL instead'
    }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';

// Store conversations in memory (use database in production)
const conversations = new Map<string, Array<{ role: string; content: string }>>();

export async function POST(request: Request) {
  try {
    const { sessionId, message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get products for context
    let productContext: Array<{ name: string; price: number; category: string; colors: string[]; description: string }> = [];
    try {
      const products = await db.product.findMany({
        take: 10,
        include: { category: true },
      });

      productContext = products.map(p => {
        let colors: string[] = [];
        try {
          colors = JSON.parse(p.colors || '[]');
        } catch {
          colors = [];
        }
        
        return {
          name: p.name,
          price: p.price,
          category: p.category.name,
          colors: colors,
          description: p.description?.slice(0, 100) || '',
        };
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue without product context
    }

    const productListText = productContext.length > 0 
      ? `Available products (use these in recommendations):\n${JSON.stringify(productContext, null, 2)}`
      : 'We currently have products being added to our collection. Feel free to ask about general fashion advice, styling tips, or our featured brands.';

    const systemPrompt = `You are a sophisticated AI fashion stylist for Clothing Ctrl, a luxury multi-brand fashion retailer. We carry brands like Gucci, Prada, Balenciaga, Chrome Hearts, Carhartt WIP, and more.

Your personality:
- Knowledgeable about luxury fashion and designer brands
- Professional yet friendly and approachable
- Up-to-date on fashion trends and styling
- Helpful with sizing and fit advice

${productListText}

Guidelines:
- Recommend specific products from our collection when available
- Suggest outfit combinations and styling tips
- Help with sizing and fit questions
- Be enthusiastic about designer fashion
- Keep responses concise but helpful (2-4 sentences)
- If asked about products not in stock, suggest alternatives from our collection
- Mention prices when recommending products`;

    // Get or create conversation history
    let history = conversations.get(sessionId);
    if (!history) {
      history = [{ role: 'assistant', content: systemPrompt }];
    }

    // Add user message
    history.push({ role: 'user', content: message });

    // Keep only last 20 messages to avoid token limits
    if (history.length > 20) {
      history = [history[0], ...history.slice(-19)];
    }

    // Create fresh ZAI instance for each request (more reliable)
    const zai = await ZAI.create();
    
    const completion = await zai.chat.completions.create({
      messages: history as Array<{ role: 'assistant' | 'user'; content: string }>,
      thinking: { type: 'disabled' }
    });

    const aiResponse = completion.choices[0]?.message?.content || 'Sorry, I could not process that. Could you try again?';

    // Add AI response to history
    history.push({ role: 'assistant', content: aiResponse });

    // Save updated history
    conversations.set(sessionId, history);

    return NextResponse.json({
      success: true,
      response: aiResponse,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ 
      error: 'Failed to process message',
      details: error instanceof Error ? error.message : 'Unknown error',
      response: 'Sorry, something went wrong. Please try again.' 
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  
  if (sessionId) {
    conversations.delete(sessionId);
  }
  
  return NextResponse.json({ success: true });
}

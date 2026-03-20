import { NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// Store conversations in memory (use database in production)
const conversations = new Map<string, Array<{ role: string; content: string }>>();

const SYSTEM_PROMPT = `You are a sophisticated AI fashion stylist for Clothing Ctrl, a luxury multi-brand fashion retailer. We carry brands like Gucci, Prada, Balenciaga, Chrome Hearts, Carhartt WIP, and more.

Your personality:
- Knowledgeable about luxury fashion and designer brands
- Professional yet friendly and approachable
- Up-to-date on fashion trends and styling
- Helpful with sizing and fit advice

Guidelines:
- Suggest outfit combinations and styling tips
- Help with sizing and fit questions
- Be enthusiastic about designer fashion
- Keep responses concise but helpful (2-4 sentences)
- Recommend similar brands if we don't carry what they're looking for`;

export async function POST(request: Request) {
  try {
    const { sessionId, message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get or create conversation history
    let history = conversations.get(sessionId);
    if (!history) {
      history = [{ role: 'assistant', content: SYSTEM_PROMPT }];
    }

    // Add user message
    history.push({ role: 'user', content: message });

    // Keep only last 20 messages to avoid token limits
    if (history.length > 20) {
      history = [history[0], ...history.slice(-19)];
    }

    // Create ZAI instance and get completion
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
      success: false,
      error: 'Failed to process message',
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

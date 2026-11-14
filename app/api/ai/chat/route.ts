import { NextRequest, NextResponse } from 'next/server';
import { AIOrchestrator, AgentId, AIMessage } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    const body = await req.json();

    const {
      agentId = 'customer_support',
      message,
      messages,
      conversationId,
      sessionId = `sess-${Date.now()}`,
      userId,
      propertyId,
      language = 'sq',
      context = {},
    } = body;

    // Normalizo mesazhet hyrëse
    let formattedMessages: AIMessage[] = [];
    if (Array.isArray(messages) && messages.length > 0) {
      formattedMessages = messages;
    } else if (typeof message === 'string' && message.trim().length > 0) {
      formattedMessages = [{ role: 'user', content: message.trim() }];
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Ju lutem shkruani një mesazh të vlefshëm.',
        },
        { status: 400 }
      );
    }

    const response = await AIOrchestrator.handleRequest({
      agentId: agentId as AgentId,
      conversationId,
      sessionId,
      userId,
      propertyId,
      messages: formattedMessages,
      language: language === 'en' ? 'en' : 'sq',
      context,
      ipAddress,
    });

    if (!response.success) {
      // Nëse u bllokua nga siguria apo emergjenca, kthejmë përgjigjen me mesazh të qartë
      const statusCode =
        response.error === 'EMERGENCY_DISABLED'
          ? 503
          : response.error === 'ACCESS_DENIED'
          ? 403
          : response.error === 'RATE_LIMIT_EXCEEDED'
          ? 429
          : response.error === 'SECURITY_BLOCKED'
          ? 400
          : 200;

      return NextResponse.json(response, { status: statusCode });
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[API /api/ai/chat] Gabim i papritur:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Ndodhi një gabim gjatë përpunimit të kërkesës AI.',
      },
      { status: 500 }
    );
  }
}

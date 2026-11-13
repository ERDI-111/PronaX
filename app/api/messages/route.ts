import { NextRequest, NextResponse } from 'next/server';
import { MessageStore } from '@/lib/messages/store';

export async function GET(req: NextRequest) {
  try {
    const messages = await MessageStore.getMessages();
    const unreadCount = await MessageStore.getUnreadCount();

    return NextResponse.json({
      success: true,
      unreadCount,
      messages,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Dështoi ngarkimi i mesazheve.' },
      { status: 500 }
    );
  }
}

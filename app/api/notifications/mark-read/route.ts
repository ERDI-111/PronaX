import { NextRequest, NextResponse } from 'next/server';
import { PaymentStore } from '@/lib/payments/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { notificationId, markAll = false, userId = 'user-erdis-001' } = body;

    if (markAll) {
      const count = await PaymentStore.markAllNotificationsAsRead(userId);
      return NextResponse.json({ success: true, markedCount: count });
    }

    if (!notificationId) {
      return NextResponse.json({ error: 'notificationId është i nevojshëm.' }, { status: 400 });
    }

    const updated = await PaymentStore.markNotificationAsRead(notificationId, userId);
    return NextResponse.json({ success: true, updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Dështoi përditësimi i njoftimit.' },
      { status: 500 }
    );
  }
}

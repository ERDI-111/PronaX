import { NextRequest, NextResponse } from 'next/server';
import { PaymentStore } from '@/lib/payments/store';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId') || 'user-erdis-001';

    const notifications = await PaymentStore.getUserNotifications(userId);
    const unreadCount = await PaymentStore.getUnreadNotificationCount(userId);

    return NextResponse.json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Dështoi ngarkimi i njoftimeve.' },
      { status: 500 }
    );
  }
}

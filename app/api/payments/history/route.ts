import { NextRequest, NextResponse } from 'next/server';
import { PaymentStore } from '@/lib/payments/store';

export async function GET(req: NextRequest) {
  // In production, user_id is extracted from authenticated session
  const userId = req.nextUrl.searchParams.get('userId') || 'user-erdis-001';

  try {
    const payments = await PaymentStore.listUserPayments(userId);
    return NextResponse.json({
      success: true,
      payments: payments.map(p => ({
        id: p.id,
        propertyId: p.property_id,
        amount: (p.amount_cents / 100).toFixed(2),
        currency: p.currency,
        purpose: p.purpose,
        provider: p.provider,
        providerTransactionId: p.provider_transaction_id,
        status: p.status,
        paymentMethod: p.payment_method,
        createdAt: p.created_at,
        metadata: p.metadata,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Dështoi leximi i historisë së pagesave.' },
      { status: 500 }
    );
  }
}

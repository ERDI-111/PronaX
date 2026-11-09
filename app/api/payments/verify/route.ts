import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payments/service';

export async function GET(req: NextRequest) {
  const paymentId = req.nextUrl.searchParams.get('paymentId');

  if (!paymentId) {
    return NextResponse.json(
      { error: 'Parametri paymentId mungon.' },
      { status: 400 }
    );
  }

  const result = await PaymentService.verifyPaymentForClient(paymentId);
  if (!result || !result.payment) {
    return NextResponse.json(
      { error: 'Pagesa nuk u gjet në sistem.' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    payment: {
      id: result.payment.id,
      status: result.payment.status,
      amount: (result.payment.amount_cents / 100).toFixed(2),
      currency: result.payment.currency,
      purpose: result.payment.purpose,
      provider: result.payment.provider,
      providerTransactionId: result.payment.provider_transaction_id,
      createdAt: result.payment.created_at,
    },
    property: result.property ? {
      id: result.property.id,
      title: result.property.title,
      status: result.property.status,
      publishedAt: result.property.published_at,
      expiresAt: result.property.expires_at,
      renewalCount: result.property.renewal_count,
    } : null,
  });
}

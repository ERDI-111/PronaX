import { NextRequest, NextResponse } from 'next/server';
import { PaymentStore } from '@/lib/payments/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentId, reason = 'Kërkesë nga administratori' } = body;

    if (!paymentId) {
      return NextResponse.json({ error: 'ID e pagesës është e detyrueshme.' }, { status: 400 });
    }

    const payment = await PaymentStore.getPayment(paymentId);
    if (!payment) {
      return NextResponse.json({ error: 'Pagesa nuk u gjet.' }, { status: 404 });
    }

    if (payment.status !== 'successful') {
      return NextResponse.json(
        { error: `Vetëm pagesat me status "successful" mund të rimbursohen. Statusi aktual: ${payment.status}` },
        { status: 400 }
      );
    }

    const updated = await PaymentStore.updatePayment(paymentId, {
      status: 'refunded',
      refund_reason: reason,
      refunded_at: new Date().toISOString(),
    });

    // Also update property status back to expired or draft
    await PaymentStore.updatePropertyStatus(payment.property_id, 'expired');

    await PaymentStore.recordEvent({
      payment_id: paymentId,
      event_type: 'payment_refunded_by_admin',
      provider: payment.provider,
      raw_payload: { reason, refundedAmountCents: payment.amount_cents },
    });

    return NextResponse.json({
      success: true,
      message: 'Pagesa u rimbursua me sukses dhe prona u kthye në statusin e skaduar.',
      payment: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Dështoi rimbursimi i pagesës.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { PaymentStore } from '@/lib/payments/store';
import { PaymentService } from '@/lib/payments/service';

export async function GET(req: NextRequest) {
  try {
    // In production, verify user role is admin with pronaxestate@gmail.com
    const report = await PaymentService.getFinancialReport();
    const allPayments = await PaymentStore.listAllPayments();

    return NextResponse.json({
      success: true,
      report,
      transactions: allPayments.map(p => ({
        id: p.id,
        propertyId: p.property_id,
        userId: p.user_id,
        amount: (p.amount_cents / 100).toFixed(2),
        currency: p.currency,
        purpose: p.purpose,
        provider: p.provider,
        providerTransactionId: p.provider_transaction_id,
        providerFee: p.provider_fee_cents ? (p.provider_fee_cents / 100).toFixed(2) : '0.00',
        status: p.status,
        paymentMethod: p.payment_method,
        createdAt: p.created_at,
        metadata: p.metadata,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Dështoi leximi i transaksioneve të administratorit.' },
      { status: 500 }
    );
  }
}

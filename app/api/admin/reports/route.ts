import { NextRequest, NextResponse } from 'next/server';

export interface PropertyReport {
  id: string;
  propertyId: string;
  propertyTitle: string;
  reporterEmail?: string;
  reason: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'actioned' | 'dismissed';
  createdAt: string;
}

// In-memory mock store for reports (integrated with reports SQL table when DB connected)
let reportsStore: PropertyReport[] = [
  {
    id: 'rep-001',
    propertyId: 'prop-ks-105',
    propertyTitle: 'Truall ndërtimor 1500m² me leje ndërtimi',
    reporterEmail: 'blerim.h@gmail.com',
    reason: 'wrong_price',
    details: 'Çmimi në telefon mu tha se është 75,000 € dhe jo 68,000 € siç shkruan në shpallje.',
    status: 'pending',
    createdAt: '2026-11-09T20:15:00Z',
  },
  {
    id: 'rep-002',
    propertyId: 'prop-ks-103',
    propertyTitle: 'Lokal afarist modern në qendër të Pejës',
    reporterEmail: 'qiramarresi@peja.org',
    reason: 'sold',
    details: 'Lokali tashmë është lëshuar me qira para 3 ditësh.',
    status: 'pending',
    createdAt: '2026-11-09T18:40:00Z',
  },
  {
    id: 'rep-003',
    propertyId: 'prop-ks-101',
    propertyTitle: 'Banesë moderne në lagjen Marigona Hill',
    reporterEmail: 'anonim@test.ks',
    reason: 'duplicate',
    details: 'E njëjta banesë është postuar dy herë.',
    status: 'reviewed',
    createdAt: '2026-11-08T14:20:00Z',
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    reports: reportsStore,
    total: reportsStore.length,
    pendingCount: reportsStore.filter((r) => r.status === 'pending').length,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.propertyId || !body.reason) {
      return NextResponse.json(
        { success: false, error: 'Të dhënat e raportimit janë të paplota.' },
        { status: 400 }
      );
    }

    const newReport: PropertyReport = {
      id: `rep-${Date.now().toString().slice(-4)}`,
      propertyId: body.propertyId,
      propertyTitle: body.propertyTitle || 'Shpallje në PronaX',
      reporterEmail: body.reporterEmail || 'anonim@pronax-ks.com',
      reason: body.reason,
      details: body.details || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    reportsStore.unshift(newReport);

    return NextResponse.json({
      success: true,
      message: 'Raporti u regjistrua me sukses dhe do të shqyrtohet nga stafi.',
      report: newReport,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Gabim gjatë regjistrimit të raportit.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    const reportIndex = reportsStore.findIndex((r) => r.id === id);
    if (reportIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Raporti nuk u gjet.' },
        { status: 404 }
      );
    }

    reportsStore[reportIndex].status = status;

    return NextResponse.json({
      success: true,
      message: 'Statusi i raportit u përditësua.',
      report: reportsStore[reportIndex],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Gabim gjatë përditësimit të raportit.' },
      { status: 500 }
    );
  }
}

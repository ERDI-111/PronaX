import { NextRequest, NextResponse } from 'next/server';
import { aiStore, RiskLevel, FraudAnalysisResult } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      propertyId = `prop-${Date.now()}`,
      userId,
      title = '',
      description = '',
      price = 0,
      currency = 'EUR',
      municipality = '',
      propertyType = 'banese',
      listingType = 'shitje',
      sellerPhone = '',
      imagesCount = 0,
    } = body;

    const reasons: string[] = [];
    const detectedIssues: Record<string, boolean> = {};
    let riskScore = 0;

    const textToAnalyze = `${title} ${description}`.toLowerCase();

    // 1. KONTROLLI I ÇMIMIT ANORMAL (Suspicious Price)
    const numPrice = Number(price);
    if (listingType === 'shitje') {
      if (numPrice < 5000 && propertyType !== 'garazhe') {
        riskScore += 45;
        reasons.push(
          `Çmimi prej ${numPrice} € për shitje të pronës (${propertyType}) është jashtëzakonisht i ulët dhe i dyshimtë për Kosovën.`
        );
        detectedIssues.suspiciousPrice = true;
      }
    } else if (listingType === 'qira') {
      if (numPrice < 30) {
        riskScore += 35;
        reasons.push(`Çmimi i qirasë prej ${numPrice} €/muaj është jorealist.`);
        detectedIssues.suspiciousPrice = true;
      }
    }

    // 2. KONTROLLI I FRAZAVE TË DYSHIMTA (Advance payment / Western Union / mashtrim)
    const suspiciousPhrases = [
      'paradhënie para se ta shihni',
      'dërgoni paratë me western union',
      'transfero kaparin pa kontratë',
      'jam jashtë vendit dërgoni paratë',
      'moneygram',
      'western union',
      'kapar i menjëhershëm pa noter',
    ];

    for (const phrase of suspiciousPhrases) {
      if (textToAnalyze.includes(phrase)) {
        riskScore += 50;
        reasons.push(`U zbulua kërkesë e dyshimtë për transfer parash: "${phrase}".`);
        detectedIssues.suspiciousDescription = true;
        break;
      }
    }

    // 3. KONTROLLI I FOTOGRAFIVE
    if (imagesCount === 0) {
      riskScore += 15;
      reasons.push('Shpallja nuk ka asnjë fotografi të ngarkuar.');
      detectedIssues.suspiciousImages = true;
    }

    // 4. KONTROLLI I KONTAKTIT
    if (!sellerPhone || sellerPhone.trim().length < 6) {
      riskScore += 10;
      reasons.push('Mungon numri i saktë i telefonit kontaktues.');
      detectedIssues.suspiciousContact = true;
    }

    // 5. PËRCAKTIMI I NIVELIT TË RREZIKUT
    let riskLevel: RiskLevel = 'low';
    let recommendation = 'approve';
    let requiresAdminReview = false;

    if (riskScore >= 75) {
      riskLevel = 'critical';
      recommendation = 'hold';
      requiresAdminReview = true;
    } else if (riskScore >= 45) {
      riskLevel = 'high';
      recommendation = 'review';
      requiresAdminReview = true;
    } else if (riskScore >= 20) {
      riskLevel = 'medium';
      recommendation = 'review';
      requiresAdminReview = false;
    } else {
      riskLevel = 'low';
      recommendation = 'approve';
      requiresAdminReview = false;
      if (reasons.length === 0) {
        reasons.push('Listimi plotëson kriteret standarde të sigurisë së PronaX.');
      }
    }

    const result: FraudAnalysisResult = {
      riskLevel,
      riskScore: Math.min(100, riskScore),
      reasons,
      detectedIssues,
      recommendation,
      requiresAdminReview,
    };

    // Ruaj flamurin në store nëse rreziku është mbi low
    if (riskLevel !== 'low' || requiresAdminReview) {
      aiStore.addModerationFlag({
        id: `flag-${Date.now()}`,
        propertyId,
        userId,
        flaggedByAgent: 'fraud_detection',
        riskLevel,
        riskScore: result.riskScore,
        reasons,
        detectedIssues,
        adminReviewed: false,
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      propertyId,
      analysis: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Dështoi moderimi i pronës.' },
      { status: 500 }
    );
  }
}

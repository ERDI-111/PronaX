/**
 * PronaX AI — AGENT 3: Fraud Detection & Moderation Agent
 * Mbron platformën nga shpalljet mashtruese dhe çmimet anormale
 */

import { FraudAnalysisResult, RiskLevel } from '../types';

export interface PropertyModerationInput {
  propertyId: string;
  title: string;
  description: string;
  price: number;
  municipality: string;
  propertyType: string;
  listingType: 'shitje' | 'qira';
  sellerPhone?: string;
  sellerEmail?: string;
  imagesCount: number;
}

export class FraudDetectionAgent {
  static readonly agentId = 'fraud_detection';

  static analyze(input: PropertyModerationInput): FraudAnalysisResult {
    const reasons: string[] = [];
    const detectedIssues: Record<string, boolean> = {};
    let riskScore = 0;

    const text = `${input.title} ${input.description}`.toLowerCase();

    // 1. ÇMIMI I DYSHIMTË / ANORMAL
    if (input.listingType === 'shitje') {
      if (input.price < 5000 && input.propertyType !== 'garazhe') {
        riskScore += 45;
        reasons.push(`Çmimi prej ${input.price} € për shitje të një ${input.propertyType} është jashtëzakonisht i ulët për tregun e Kosovës.`);
        detectedIssues.suspiciousPrice = true;
      }
    } else if (input.listingType === 'qira') {
      if (input.price < 30) {
        riskScore += 35;
        reasons.push(`Çmimi i qirasë prej ${input.price} €/muaj është i pazakontë.`);
        detectedIssues.suspiciousPrice = true;
      }
    }

    // 2. TENTATIVË PËR PAGESË JASHTË PLATFORMËS APO TRANSFER PARADHËNIE
    const scamTriggers = [
      'paradhënie para se ta shihni',
      'western union',
      'moneygram',
      'transfero kaparin',
      'jam jashtë vendit dërgoni paratë',
      'pagesë me kriptomonedha',
      'bitcoin paradhënie',
    ];

    for (const trigger of scamTriggers) {
      if (text.includes(trigger)) {
        riskScore += 55;
        reasons.push(`U zbulua kërkesë e dyshimtë: "${trigger}".`);
        detectedIssues.suspiciousDescription = true;
        break;
      }
    }

    // 3. FOTOGRAFITË DHE MEDIA
    if (input.imagesCount === 0) {
      riskScore += 15;
      reasons.push('Listimi nuk përmban fotografi reale.');
      detectedIssues.suspiciousImages = true;
    }

    // 4. KONTAKTI I SHITËSIT
    if (!input.sellerPhone || input.sellerPhone.trim().length < 6) {
      riskScore += 15;
      reasons.push('Numri i kontaktit mungon ose është i paplotë.');
      detectedIssues.suspiciousContact = true;
    }

    // 5. PËRCAKTIMI I REZULTATIT PËRFUNDIMTAR
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
        reasons.push('Shpallja është në përputhje me standardet e sigurisë.');
      }
    }

    return {
      riskLevel,
      riskScore: Math.min(100, riskScore),
      reasons,
      detectedIssues,
      recommendation,
      requiresAdminReview,
    };
  }
}

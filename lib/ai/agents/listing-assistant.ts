/**
 * PronaX AI — AGENT 2: Property Listing Assistant
 * Ndihmon në krijimin e titujve dhe përshkrimeve profesionale
 * Rregull kryesor: Përdoruesi duhet të aprovojë përmbajtjen para publikimit
 */

import { ListingAssistance } from '../types';
import { SYSTEM_PROMPTS } from '../prompts/system-prompts';
import { ClaudeClient, getClaudeClient } from '../client';

export interface ListingInputData {
  municipality: string;
  settlement?: string;
  propertyType: string;
  listingType: 'shitje' | 'qira';
  price: number;
  areaM2?: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  furnished?: string;
  features?: string[];
  userNotes?: string;
}

export class ListingAssistantAgent {
  static readonly agentId = 'listing_assistant';

  static async generate(
    data: ListingInputData,
    language: 'sq' | 'en' = 'sq'
  ): Promise<ListingAssistance> {
    const missingFields: string[] = [];
    if (!data.areaM2) missingFields.push('Sipërfaqja (m²)');
    if (!data.bedrooms && data.propertyType === 'banese') missingFields.push('Numri i dhomave');
    if (!data.floor && data.propertyType === 'banese') missingFields.push('Kati');
    if (!data.settlement) missingFields.push('Lagjja / Zona e saktë');

    let qualityScore = 100 - missingFields.length * 15;
    if (data.price <= 0) qualityScore -= 20;
    qualityScore = Math.max(30, Math.min(100, qualityScore));

    // Nëse Claude API është i konfiguruar, gjenerojmë tekst të lartë letrar
    if (ClaudeClient.isConfigured()) {
      try {
        const client = getClaudeClient();
        const prompt = `Gjenero titull dhe përshkrim profesional për këtë pronë në Kosovë:
- Komuna: ${data.municipality} (Lagjja: ${data.settlement || 'e pacaktuar'})
- Lloji: ${data.propertyType} me ${data.listingType}
- Çmimi: ${data.price} €
- Sipërfaqja: ${data.areaM2 || 'e pacaktuar'} m²
- Dhomat: ${data.bedrooms || 'të pacaktuara'}
- Shënime shtesë nga pronari: ${data.userNotes || 'nuk ka'}

KUJDES: Mos shpik veçori që nuk përmenden më lart. Ktheje në format JSON me fushat: suggestedTitle, suggestedDescription, keywords.`;

        const response = await client.complete({
          model: 'claude-sonnet-4-5',
          maxTokens: 1024,
          temperature: 0.7,
          systemPrompt: SYSTEM_PROMPTS.listing_assistant,
          messages: [{ role: 'user', content: prompt }],
        });

        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            suggestedTitle: parsed.suggestedTitle,
            suggestedDescription: parsed.suggestedDescription,
            keywords: parsed.keywords || ['prona kosove', data.municipality, data.propertyType],
            missingFields,
            qualityScore,
            approved: false, // Mandatory
          };
        }
      } catch (err) {
        console.warn('[ListingAssistantAgent] Claude API dështoi, përdorim gjeneruesin e strukturuar:', err);
      }
    }

    // Motori autonom me gramatikë të pastër shqipe
    return this.generateAutonomousAssistance(data, missingFields, qualityScore, language);
  }

  private static generateAutonomousAssistance(
    data: ListingInputData,
    missingFields: string[],
    qualityScore: number,
    language: 'sq' | 'en'
  ): ListingAssistance {
    const qyteti = data.municipality ? data.municipality.charAt(0).toUpperCase() + data.municipality.slice(1) : 'Kosovë';
    const lagjja = data.settlement ? ` (${data.settlement})` : '';
    const lloji = data.propertyType === 'banese' ? 'Banesë' : data.propertyType === 'shtepi' ? 'Shtëpi' : 'Pronë';
    const veprimi = data.listingType === 'qira' ? 'me Qira' : 'në Shitje';
    const dhomatText = data.bedrooms ? ` me ${data.bedrooms} Dhoma Gjumi` : '';
    const siperfaqjaText = data.areaM2 ? ` (${data.areaM2} m²)` : '';

    const suggestedTitle = `${lloji} ${veprimi} në ${qyteti}${lagjja}${siperfaqjaText}${dhomatText}`;

    const suggestedDescription =
      `Ofrohet ${lloji.toLowerCase()} ${veprimi.toLowerCase()} në një lokacion shumë të përshtatshëm në ${qyteti}${lagjja}. ` +
      (data.areaM2 ? `Prona posedon një sipërfaqe prej ${data.areaM2} m² me planimetri funksionale dhe organizim shumë praktik të hapësirës. ` : '') +
      (data.bedrooms ? `Ka ${data.bedrooms} dhoma gjumi komode dhe ndriçim të shkëlqyer natyror gjatë gjithë ditës. ` : '') +
      `Gjendet afër shërbimeve kryesore, qendrave tregtare dhe transportit publik. ` +
      `Çmimi: ${data.price} €. Për informata shtesë dhe vizitë të drejtpërdrejtë në pronë, ju lutem na kontaktoni.`;

    const keywords = [
      data.propertyType,
      data.listingType,
      data.municipality,
      'patundshmeri kosove',
      'prona ne shitje',
      'prona me qira',
    ];

    return {
      suggestedTitle,
      suggestedDescription,
      keywords,
      missingFields,
      qualityScore,
      approved: false, // Gjithmonë false derisa përdoruesi ta aprovojë me buton
    };
  }
}

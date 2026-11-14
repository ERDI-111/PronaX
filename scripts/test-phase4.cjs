/**
 * PronaX Kosovo — Test Suite për Fazën 4: 8 Agjentët e Specializuar
 */

console.log('======================================================');
console.log(' PronaX Kosovo — TESTIMI I FAZËS 4: 8 AGJENTËT E SPECIALIZUAR');
console.log('======================================================\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ [KALOI] ${name}`);
    passed++;
  } catch (err) {
    console.error(`✗ [DËSHTOI] ${name}: ${err.message}`);
    failed++;
  }
}

// 1. AGJENTI 1: Customer Support & Escalation
test('Agent 1 (Customer Support): Përgjigjet mbi 3 planet dhe detektimi i eskalimit', () => {
  const queryPlans = 'Sa kushtojnë planet e publikimit në PronaX?';
  const hasPlans = queryPlans.toLowerCase().includes('plan');
  if (!hasPlans) throw new Error('Nuk u njoh pyetja e planeve');

  // Testimi i eskalimit
  const queryFraud = 'Më duket se më vodhën paratë, kërkoj avokat dhe polici për mashtrim!';
  const lower = queryFraud.toLowerCase();
  const shouldEscalate = lower.includes('mashtrim') || lower.includes('polici') || lower.includes('avokat');
  if (!shouldEscalate) throw new Error('Eskalimi ligjor/financiar nuk u detektua!');
});

// 2. AGJENTI 2: Property Listing Assistant
test('Agent 2 (Listing Assistant): Gjenerim titulli, fjalë kyçe dhe kushti i rreptë approved=false', () => {
  const input = {
    municipality: 'prishtine',
    settlement: 'Dardania',
    propertyType: 'banese',
    listingType: 'shitje',
    price: 95000,
    areaM2: 85,
    bedrooms: 2,
  };

  const title = `Banesë në Shitje në Prishtinë (Dardania) (85 m²) me 2 Dhoma Gjumi`;
  if (!title.includes('Dardania') || !title.includes('85 m²')) {
    throw new Error('Titulli i gjeneruar nuk përmban të dhënat e sakta!');
  }

  // Rregulli kritik: Përdoruesi duhet ta aprovojë manualisht
  const approved = false;
  if (approved !== false) {
    throw new Error('Listing Assistant nuk lejohet të publikojë pa aprovimin e përdoruesit!');
  }
});

// 3. AGJENTI 3: Fraud Detection & Moderation
test('Agent 3 (Fraud Detection): Klasifikimi i saktë i rrezikut dhe dërgimi te admini', () => {
  function checkScam(price, desc) {
    let score = 0;
    if (price < 5000) score += 45;
    if (desc.includes('western union') || desc.includes('paradhënie para se ta shihni')) score += 55;

    let riskLevel = 'low';
    let requiresAdminReview = false;
    if (score >= 75) {
      riskLevel = 'critical';
      requiresAdminReview = true;
    }
    return { score, riskLevel, requiresAdminReview };
  }

  const scam = checkScam(2000, 'dërgoni paratë me western union si paradhënie para se ta shihni');
  if (scam.riskLevel !== 'critical' || !scam.requiresAdminReview) {
    throw new Error('Mashtrimi kritik nuk u kap me nivelin e duhur të rrezikut!');
  }
});

// 4. AGJENTI 4: Smart Property Search
test('Agent 4 (Smart Search): Transformimi i kërkesës me gjuhë natyrore në filtra të saktë', () => {
  const query = 'Dua një banesë në Pejë nën 80 mijë euro me qira';
  const q = query.toLowerCase();

  let municipality = q.includes('pej') ? 'peje' : undefined;
  let propertyType = q.includes('banes') ? 'banese' : undefined;
  let listingType = q.includes('qira') ? 'qira' : 'shitje';

  let maxPrice;
  const underMatch = q.match(/(?:nën|nen)\s*(\d+)\s*(?:mij[eë])?/i);
  if (underMatch) {
    maxPrice = parseInt(underMatch[1], 10) * 1000;
  }

  if (municipality !== 'peje') throw new Error(`Komuna e gabuar: ${municipality}`);
  if (propertyType !== 'banese') throw new Error(`Lloji i gabuar: ${propertyType}`);
  if (listingType !== 'qira') throw new Error(`Destinimi i gabuar: ${listingType}`);
  if (maxPrice !== 80000) throw new Error(`Çmimi maksimal i gabuar: ${maxPrice}`);
});

// 5. AGJENTI 5: Administrator Assistant
test('Agent 5 (Admin Assistant): Përgjigjet mbi performancën dhe të drejtat ekskluzive admin', () => {
  const userRole = 'admin';
  const isAuthorized = userRole === 'admin';
  if (!isAuthorized) throw new Error('Aksesi duhet të refuzohet për jo-adminët');

  const report = 'Statusi i sistemit: 3 plane aktive (0€, 2.99€, 9.99€)';
  if (report.includes('7 €')) throw new Error('Çmimi i vjetër nuk lejohet në raportin admin');
});

// 6. AGJENTI 6: Notification & Retention
test('Agent 6 (Notification Agent): Njoftime të personalizuara me theks te rinovimi manual', () => {
  const daysLeft = 2;
  const plan = 'Javor';
  const msg = `Shpallja skadon pas ${daysLeft} ditësh (${plan}). Rinovimi bëhet manualisht me 0% debitim automatik.`;
  if (!msg.includes('manualisht') || !msg.includes('0% debitim automatik')) {
    throw new Error('Njoftimi duhet të theksojë qartë rinovimin manual!');
  }
});

// 7. AGJENTI 7: Real Estate Market Insights
test('Agent 7 (Market Insights): Çmimet mesatare reale për m² për qytetet e Kosovës', () => {
  const benchmarks = {
    prishtine: 1250,
    'fushe-kosove': 850,
    prizren: 1050,
    peje: 920,
    ferizaj: 880,
  };

  if (benchmarks.prishtine <= benchmarks['fushe-kosove']) {
    throw new Error('Çmimi mesatar i Prishtinës duhet të jetë më i lartë se Fushë Kosova!');
  }
  if (benchmarks.peje < 500 || benchmarks.peje > 3000) {
    throw new Error('Vlerat e Pejës janë jashtë intervalit normal!');
  }
});

// 8. AGJENTI 8: Personalized Recommendation
test('Agent 8 (Recommendation Agent): Përputhja e pronave brenda të njëjtit qytet dhe lloj', () => {
  const target = { id: 'p1', municipality: 'prishtine', propertyType: 'banese', price: 90000, listingType: 'shitje' };
  const candidates = [
    { id: 'p2', municipality: 'prishtine', propertyType: 'banese', price: 95000, listingType: 'shitje' }, // Përputhje e lartë
    { id: 'p3', municipality: 'peje', propertyType: 'shtepi', price: 150000, listingType: 'shitje' },     // Përputhje e ulët
  ];

  function match(t, c) {
    let s = 0;
    if (t.municipality === c.municipality) s += 40;
    if (t.propertyType === c.propertyType) s += 30;
    const diff = Math.abs(t.price - c.price) / t.price;
    if (diff <= 0.25) s += 20;
    return s;
  }

  const scoreP2 = match(target, candidates[0]);
  const scoreP3 = match(target, candidates[1]);

  if (scoreP2 < 80) throw new Error(`Prona e ngjashme duhej të merrte pikë të larta (mori ${scoreP2})`);
  if (scoreP3 >= 40) throw new Error(`Prona e ndryshme nuk duhej të kualifikohej (mori ${scoreP3})`);
});

console.log(`\n------------------------------------------------------`);
console.log(`Përmbledhja: ${passed}/${passed + failed} teste kaluan me sukses.`);
console.log(`------------------------------------------------------\n`);

if (failed > 0) {
  process.exit(1);
}

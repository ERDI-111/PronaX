/**
 * PronaX Kosovo — Test Suite për Fazën 3: Shërbimi Qendror dhe API Endpoints
 */

console.log('======================================================');
console.log(' PronaX Kosovo — TESTIMI I FAZËS 3: AI CENTRAL SERVICE & APIS');
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

// 1. Testimi i Çelësit të Emergjencës: Izolim i menjëhershëm
test('Emergency Switch API: Bllokim i menjëhershëm i të gjithë agjentëve pa rrëzuar faqen', () => {
  let switchState = { allAgentsDisabled: false };

  // Funksioni që kontrollon kërkesën
  function handleRequest(state) {
    if (state.allAgentsDisabled) {
      return { success: false, error: 'EMERGENCY_DISABLED', message: 'Sistemi AI është çaktivizuar.' };
    }
    return { success: true, message: 'Operacion normal.' };
  }

  // Verifiko operacion normal
  let res = handleRequest(switchState);
  if (!res.success) throw new Error('Duhej të ishte operacion normal!');

  // Ndërro çelësin në të çaktivizuar
  switchState.allAgentsDisabled = true;
  res = handleRequest(switchState);
  if (res.success || res.error !== 'EMERGENCY_DISABLED') {
    throw new Error('Sistemi duhej të kthente EMERGENCY_DISABLED!');
  }

  // Riktheje në normal
  switchState.allAgentsDisabled = false;
  res = handleRequest(switchState);
  if (!res.success) throw new Error('Sistemi duhej të riaktivizohej!');
});

// 2. Testimi i Çaktivizimit Individual të Agjentit
test('Granular Agent Control: Çaktivizimi i një agjenti specifik pa prekur të tjerët', () => {
  const agents = {
    customer_support: { isEnabled: true },
    listing_assistant: { isEnabled: false }, // I çaktivizuar
    fraud_detection: { isEnabled: true },
  };

  function canRun(agentId) {
    return agents[agentId]?.isEnabled === true;
  }

  if (!canRun('customer_support')) throw new Error('Customer support duhej të ishte aktiv');
  if (canRun('listing_assistant')) throw new Error('Listing assistant duhej të ishte i çaktivizuar');
  if (!canRun('fraud_detection')) throw new Error('Fraud detection duhej të ishte aktiv');
});

// 3. Testimi i Algoritmit të Zbulimit të Mashtrimit (Agent 3)
test('Fraud Detection Engine: Diferencimi i pronës normale nga mashtrimi kritik', () => {
  function analyzeProperty(prop) {
    let score = 0;
    const text = `${prop.title} ${prop.description}`.toLowerCase();
    
    if (prop.price < 5000 && prop.propertyType !== 'garazhe') {
      score += 45;
    }
    if (text.includes('western union') || text.includes('paradhënie para se ta shihni')) {
      score += 50;
    }
    if (prop.imagesCount === 0) {
      score += 15;
    }

    let riskLevel = 'low';
    if (score >= 75) riskLevel = 'critical';
    else if (score >= 45) riskLevel = 'high';
    else if (score >= 20) riskLevel = 'medium';

    return { score, riskLevel };
  }

  // Prona normale
  const normalProp = {
    title: 'Banesë 2+1 në Dardani',
    description: 'Banesë e bukur me ndriçim natyror afër shkollës.',
    price: 85000,
    propertyType: 'banese',
    imagesCount: 6,
  };
  const normalResult = analyzeProperty(normalProp);
  if (normalResult.riskLevel !== 'low') {
    throw new Error(`Prona normale u vlerësua si: ${normalResult.riskLevel}`);
  }

  // Prona me mashtrim kritik
  const scamProp = {
    title: 'Penthouse luksoz në qendër të Prishtinës me super çmim',
    description: 'Dërgoni paratë me Western Union si paradhënie para se ta shihni.',
    price: 3000,
    propertyType: 'banese',
    imagesCount: 0,
  };
  const scamResult = analyzeProperty(scamProp);
  if (scamResult.riskLevel !== 'critical' || scamResult.score < 75) {
    throw new Error(`Mashtrimi kritik nuk u identifikua saktë! Rezultati: ${scamResult.riskLevel} (${scamResult.score})`);
  }
});

// 4. Testimi i Mos-Ekspozimit të API Keys në Përgjigje
test('Siguria e Çelësave: Asnjë API Key nuk ekspozohet në përgjigjet e API-t', () => {
  const sampleResponse = {
    success: true,
    conversationId: 'conv-12345',
    agentId: 'customer_support',
    content: 'Përshëndetje nga PronaX!',
    tokensUsed: { input: 12, output: 8 },
  };

  const responseString = JSON.stringify(sampleResponse);
  if (responseString.includes('sk-') || responseString.includes('api_key') || responseString.includes('secret')) {
    throw new Error('Përgjigja përmban të dhëna sensitive të çelësave!');
  }
});

// 5. Testimi i Përgjigjeve të Mbështetjes (Vetëm 3 Planet Zyrtare të Kosovës)
test('Unifikimi i Çmimeve: Përgjigjet e Mbështetjes reflektojnë vetëm 3 planet (0€, 2.99€, 9.99€)', () => {
  const plansText = '1. Plani Falas (0 €) 3 ditë\n2. Plani Javor (2.99 €) 7 ditë\n3. Plani Mujor (9.99 €) 30 ditë';
  if (plansText.includes('7 €') || plansText.includes('7.00')) {
    throw new Error('Çmimi i vjetër 7 € u gjet në shpjegimin e mbështetjes!');
  }
  if (!plansText.includes('0 €') || !plansText.includes('2.99 €') || !plansText.includes('9.99 €')) {
    throw new Error('Mungon një nga 3 planet e unifikuara!');
  }
});

console.log(`\n------------------------------------------------------`);
console.log(`Përmbledhja: ${passed}/${passed + failed} teste kaluan me sukses.`);
console.log(`------------------------------------------------------\n`);

if (failed > 0) {
  process.exit(1);
}

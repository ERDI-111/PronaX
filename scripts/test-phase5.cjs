/**
 * PronaX Kosovo — Test Suite për Fazën 5: Customer-Facing AI Interfaces
 */

const fs = require('fs');
const path = require('path');

console.log('======================================================');
console.log(' PronaX Kosovo — TESTIMI I FAZËS 5: CUSTOMER-FACING AI INTERFACES');
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

const ROOT = path.join(__dirname, '..');

// 1. Ekzistenca e 4 komponentëve vizualë të AI
test('Struktura e Komponentëve: Ekzistenca e të 4 komponentëve të rinj UI në components/ai/', () => {
  const components = [
    'components/ai/AICustomerChatbot.tsx',
    'components/ai/AIListingAssistantModal.tsx',
    'components/ai/AISmartSearchBar.tsx',
    'components/ai/AIMarketInsightsCard.tsx',
    'components/ai/index.ts',
  ];

  for (const comp of components) {
    const fullPath = path.join(ROOT, comp);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Mungon skedari i komponentit: ${comp}`);
    }
  }
});

// 2. Integrimi i Floating Chatbot në Layout-in Global
test('Integrimi Global: AICustomerChatbot është integruar në app/layout.tsx', () => {
  const layoutContent = fs.readFileSync(path.join(ROOT, 'app/layout.tsx'), 'utf-8');
  if (!layoutContent.includes('AICustomerChatbot')) {
    throw new Error('AICustomerChatbot nuk gjendet i thirrur në app/layout.tsx!');
  }
});

// 3. Integrimi i Asistentit të Shpalljeve në Publikim
test('Integrimi në Publiko: AIListingAssistantModal është integruar te Hapi 3 i app/publiko/page.tsx', () => {
  const publikoContent = fs.readFileSync(path.join(ROOT, 'app/publiko/page.tsx'), 'utf-8');
  if (!publikoContent.includes('AIListingAssistantModal')) {
    throw new Error('AIListingAssistantModal nuk gjendet te app/publiko/page.tsx!');
  }
  if (!publikoContent.includes('onApply')) {
    throw new Error('Mungon handler-i i aprovimit të përdoruesit onApply!');
  }
});

// 4. Integrimi i Kërkimit Inteligjent me AI në Ballinë
test('Integrimi në Ballinë: AISmartSearchBar është integruar në components/HomepageClient.tsx', () => {
  const homeContent = fs.readFileSync(path.join(ROOT, 'components/HomepageClient.tsx'), 'utf-8');
  if (!homeContent.includes('AISmartSearchBar')) {
    throw new Error('AISmartSearchBar nuk gjendet te components/HomepageClient.tsx!');
  }
});

// 5. Integrimi i Analizës së Tregut në Detajet e Pronës
test('Integrimi te Detajet e Pronës: AIMarketInsightsCard është integruar te app/prona/[id]/page.tsx', () => {
  const pronaContent = fs.readFileSync(path.join(ROOT, 'app/prona/[id]/page.tsx'), 'utf-8');
  if (!pronaContent.includes('AIMarketInsightsCard')) {
    throw new Error('AIMarketInsightsCard nuk gjendet te app/prona/[id]/page.tsx!');
  }
});

// 6. Ruajtja e Paletës së Ngjyrave Zyrtare
test('Dizajni & UI/UX: Përdorimi i ngjyrave zyrtare Deep Navy (#0B192C) dhe Emerald Green (#059669)', () => {
  const chatbotContent = fs.readFileSync(path.join(ROOT, 'components/ai/AICustomerChatbot.tsx'), 'utf-8');
  if (!chatbotContent.includes('#0B192C') && !chatbotContent.includes('emerald')) {
    throw new Error('Paleta zyrtare nuk është zbatuar në chatbot!');
  }
});

console.log(`\n------------------------------------------------------`);
console.log(`Përmbledhja: ${passed}/${passed + failed} teste kaluan me sukses.`);
console.log(`------------------------------------------------------\n`);

if (failed > 0) {
  process.exit(1);
}

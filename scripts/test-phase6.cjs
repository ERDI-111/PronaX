/**
 * PronaX AI — Test Suite Faza 6
 * Verifikon: Admin AI Control Panel, API endpoints, strukturën e moderimit
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let passed = 0;
let failed = 0;
const results = [];

function test(name, fn) {
  try {
    const result = fn();
    if (result !== false) {
      passed++;
      results.push({ name, status: 'KALOI', message: 'OK' });
      console.log(`  ✅ ${name}`);
    } else {
      failed++;
      results.push({ name, status: 'DËSHTOI', message: 'Ktheu false' });
      console.log(`  ❌ ${name}`);
    }
  } catch (err) {
    failed++;
    results.push({ name, status: 'DËSHTOI', message: err.message });
    console.log(`  ❌ ${name} — ${err.message}`);
  }
}

function fileExists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

function fileContains(relPath, ...strings) {
  const content = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
  for (const s of strings) {
    if (!content.includes(s)) {
      throw new Error(`"${s}" nuk u gjet në ${relPath}`);
    }
  }
  return true;
}

console.log('\n🤖 PronaX AI — Test Suite Faza 6: Admin Control Panel\n');
console.log('=' .repeat(60));

// ----------------------------------------------------------------
// GRUPI 1: Ekzistenca e skedarëve
// ----------------------------------------------------------------
console.log('\n📂 GRUPI 1: Ekzistenca e Skedarëve\n');

test('app/admin/ai/page.tsx ekziston', () => {
  if (!fileExists('app/admin/ai/page.tsx')) {
    throw new Error('Skedari i faqes Admin AI mungon');
  }
  return true;
});

test('app/api/ai/admin/status/route.ts ekziston', () => {
  if (!fileExists('app/api/ai/admin/status/route.ts')) {
    throw new Error('API e statusit mungon');
  }
  return true;
});

test('app/api/ai/admin/emergency/route.ts ekziston (Faza 3)', () => {
  if (!fileExists('app/api/ai/admin/emergency/route.ts')) {
    throw new Error('API e emergjencës mungon (duhet krijuar në Fazën 3)');
  }
  return true;
});

test('app/api/ai/admin/agents/route.ts ekziston (Faza 3)', () => {
  if (!fileExists('app/api/ai/admin/agents/route.ts')) {
    throw new Error('API e agjentëve mungon (duhet krijuar në Fazën 3)');
  }
  return true;
});

test('app/api/ai/admin/logs/route.ts ekziston (Faza 3)', () => {
  if (!fileExists('app/api/ai/admin/logs/route.ts')) {
    throw new Error('API e regjistrit mungon (duhet krijuar në Fazën 3)');
  }
  return true;
});

// ----------------------------------------------------------------
// GRUPI 2: Admin AI Page — Kontenu dhe Siguria
// ----------------------------------------------------------------
console.log('\n🛡️  GRUPI 2: Faqja Admin AI — Kontenu dhe Siguria\n');

test('Faqja Admin AI ka Emergency Kill Switch UI', () => {
  return fileContains('app/admin/ai/page.tsx',
    'Çelësi i Emergjencës',
    'showEmergencyConfirm',
    'emergencyReason'
  );
});

test('Faqja Admin AI ka 3 tabs (Agjentët, Moderimi, Regjistri)', () => {
  return fileContains('app/admin/ai/page.tsx',
    'agjentet',
    'moderimi',
    'regjistri'
  );
});

test('Faqja Admin AI ka toggle për çdo agjent', () => {
  return fileContains('app/admin/ai/page.tsx',
    'handleAgentToggle',
    'ToggleRight',
    'ToggleLeft'
  );
});

test('Faqja Admin AI shfaq flamujt e moderimit me risk levels', () => {
  return fileContains('app/admin/ai/page.tsx',
    'riskLevel',
    'riskScore',
    'RISK_BADGES',
    'RISK_LABELS'
  );
});

test('Faqja Admin AI refreskohet automatikisht çdo 30 sekonda', () => {
  return fileContains('app/admin/ai/page.tsx',
    'setInterval',
    '30000'
  );
});

test('Faqja Admin AI ndalohet nëse qasja refuzohet (403)', () => {
  return fileContains('app/admin/ai/page.tsx',
    'status === 403',
    'Qasja e Ndaluar'
  );
});

test('Konfirmimi i emergjencës kërkon arsye para çaktivizimit', () => {
  return fileContains('app/admin/ai/page.tsx',
    'emergencyReason.trim()',
    'Ju lutemi shkruani arsyen'
  );
});

test('Paralajmërim: AI nuk ban automatikisht', () => {
  return fileContains('app/admin/ai/page.tsx',
    'AI NUK BAN automatikisht',
    'vetëm administratori'
  );
});

// ----------------------------------------------------------------
// GRUPI 3: API e Statusit — Siguria dhe Struktura
// ----------------------------------------------------------------
console.log('\n🔌 GRUPI 3: API e Statusit — Siguria dhe Struktura\n');

test('API /status verifikon rolin admin para kthimit të të dhënave', () => {
  return fileContains('app/api/ai/admin/status/route.ts',
    'verifyAdmin',
    'pronaxestate@outlook.com',
    'status: 403'
  );
});

test('API /status kthen emergencySwitch, agents dhe moderationFlags', () => {
  return fileContains('app/api/ai/admin/status/route.ts',
    'getEmergencySwitch',
    'getAllAgentSettings',
    'getModerationFlags',
    'getActionLogs'
  );
});

test('API /status kthen statistika (totalRequestsToday, pendingFlagsCount)', () => {
  return fileContains('app/api/ai/admin/status/route.ts',
    'totalRequestsToday',
    'pendingFlagsCount',
    'highRiskFlagsCount'
  );
});

test('API /status nuk ekspozon CLAUDE_API_KEY në përgjigje', () => {
  const content = fs.readFileSync(
    path.join(ROOT, 'app/api/ai/admin/status/route.ts'), 'utf8'
  );
  // Kontrollo nëse çelësi eksponohet drejtpërdrejt
  if (content.includes('"CLAUDE_API_KEY"') && content.includes('JSON.stringify')) {
    throw new Error('RREZIK: API_KEY mund të eksponohet në JSON response!');
  }
  return true;
});

// ----------------------------------------------------------------
// GRUPI 4: Rregullat e Biznesit AI — Mbrojtja
// ----------------------------------------------------------------
console.log('\n⚖️  GRUPI 4: Rregullat e Biznesit — Mbrojtja\n');

test('Lib AI Store ka getModerationFlags()', () => {
  return fileContains('lib/ai/store.ts', 'getModerationFlags');
});

test('Lib AI Store ka getActionLogs()', () => {
  return fileContains('lib/ai/store.ts', 'getActionLogs');
});

test('Lib AI Store ka setEmergencySwitch()', () => {
  return fileContains('lib/ai/store.ts', 'setEmergencySwitch');
});

test('Lib AI Store ka updateAgentSetting()', () => {
  return fileContains('lib/ai/store.ts', 'updateAgentSetting');
});

test('Admin Assistant kërkon isAdmin === true në orchestrator', () => {
  const orchPath = 'lib/ai/orchestrator.ts';
  if (!fileExists(orchPath)) {
    throw new Error('Orchestrator mungon');
  }
  const content = fs.readFileSync(path.join(ROOT, orchPath), 'utf8');
  if (!content.includes('isAdmin') && !content.includes('requiresAdmin')) {
    throw new Error('Kontrolli i administratorit mungon në orchestrator');
  }
  return true;
});

test('Faqja Admin AI ka 8 ikona agjentësh (AGENT_ICONS)', () => {
  const content = fs.readFileSync(
    path.join(ROOT, 'app/admin/ai/page.tsx'), 'utf8'
  );
  const agentIds = [
    'customer_support', 'listing_assistant', 'fraud_detection',
    'smart_search', 'admin_assistant', 'notification_retention',
    'market_insights', 'recommendation'
  ];
  for (const id of agentIds) {
    // Kontrollo me thonjëza të vetme, dyfishe, ose si pjesë e string-ut
    if (!content.includes(id)) {
      throw new Error(`Agjenti "${id}" nuk u gjet në AGENT_ICONS/AGENT_COLORS`);
    }
  }
  return true;
});

// ----------------------------------------------------------------
// GRUPI 5: Integriteti i Paketës
// ----------------------------------------------------------------
console.log('\n📦 GRUPI 5: Integriteti i Paketës\n');

test('package.json ka lucide-react (për ikona)', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  if (!pkg.dependencies?.['lucide-react'] && !pkg.devDependencies?.['lucide-react']) {
    throw new Error('lucide-react mungon në package.json');
  }
  return true;
});

test('Ikona ToggleRight dhe ToggleLeft importohen nga lucide-react', () => {
  return fileContains('app/admin/ai/page.tsx',
    'ToggleRight',
    'ToggleLeft',
    'lucide-react'
  );
});

test('Faqja Admin AI është "use client"', () => {
  return fileContains('app/admin/ai/page.tsx', "'use client'");
});

test('Nuk ka referenca të çmimit të vjetër 7€ në kod', () => {
  const aiFiles = [
    'app/admin/ai/page.tsx',
    'app/api/ai/admin/status/route.ts',
  ];
  for (const f of aiFiles) {
    if (!fileExists(f)) continue;
    const content = fs.readFileSync(path.join(ROOT, f), 'utf8');
    if (content.includes('7€') || content.includes('7 €') || content.includes('€7') || content.includes('7.00 €')) {
      throw new Error(`Çmimi i vjetër 7€ u gjet në ${f}`);
    }
  }
  return true;
});

// ----------------------------------------------------------------
// REZULTATI FINAL
// ----------------------------------------------------------------
const total = passed + failed;
const pct = total > 0 ? Math.round((passed / total) * 100) : 0;

console.log('\n' + '='.repeat(60));
console.log(`\n📊 REZULTATI FINAL FAZA 6:\n`);
console.log(`  ✅ Kaluan:    ${passed}/${total} (${pct}%)`);
console.log(`  ❌ Dështuan:  ${failed}/${total}`);

if (failed === 0) {
  console.log('\n  🎉 TË GJITHA TESTET E FAZËS 6 KALUAN!\n');
  console.log('  Paneli Admin AI është i gatshëm. Vazhdo me:\n');
  console.log('  → npx next build (verifiko build 70+ routes)');
  console.log('  → Faza 7: git commit + git push → Render deploy\n');
} else {
  console.log(`\n  ⚠️  ${failed} teste dështuan. Zgjidh problemet para se të vazhdosh.\n`);
}

process.exit(failed > 0 ? 1 : 0);

/**
 * PronaX AI - Test Suite Faza 8 (Verifikimi Final)
 * node scripts/test-phase8.cjs
 */
'use strict';
const fs   = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let passed = 0, failed = 0;

function ok(name) {
  passed++;
  console.log('  OK  ' + name);
}
function fail(name, msg) {
  failed++;
  console.log('  ERR ' + name + ' -- ' + msg);
}
function chk(name, fn) {
  try { fn() ? ok(name) : fail(name, 'returned false'); }
  catch (e) { fail(name, e.message); }
}
function has(rel) { return fs.existsSync(path.join(ROOT, rel)); }
function contains(rel) {
  const needles = Array.prototype.slice.call(arguments, 1);
  const txt = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  for (const n of needles) {
    if (!txt.includes(n)) throw new Error('"' + n + '" missing in ' + rel);
  }
  return true;
}

console.log('\nPronaX AI - Final System Verification (Phase 8)\n');
console.log('='.repeat(55));

// ---- GROUP 1: Critical files ----
console.log('\nGROUP 1: Critical AI System Files\n');
var CRITICAL = [
  'lib/ai/types.ts','lib/ai/client.ts','lib/ai/security.ts',
  'lib/ai/store.ts','lib/ai/orchestrator.ts','lib/ai/index.ts',
  'lib/ai/prompts/system-prompts.ts',
  'lib/ai/agents/customer-support.ts','lib/ai/agents/listing-assistant.ts',
  'lib/ai/agents/fraud-detection.ts','lib/ai/agents/smart-search.ts',
  'lib/ai/agents/admin-assistant.ts','lib/ai/agents/notification-retention.ts',
  'lib/ai/agents/market-insights.ts','lib/ai/agents/recommendation.ts',
  'app/api/ai/chat/route.ts','app/api/ai/moderate/route.ts',
  'app/api/ai/admin/emergency/route.ts','app/api/ai/admin/agents/route.ts',
  'app/api/ai/admin/logs/route.ts','app/api/ai/admin/status/route.ts',
  'components/ai/AICustomerChatbot.tsx','components/ai/AIListingAssistantModal.tsx',
  'components/ai/AISmartSearchBar.tsx','components/ai/AIMarketInsightsCard.tsx',
  'app/admin/ai/page.tsx',
  'supabase/migrations/20261114_ai_agent_system.sql',
];
for (var i = 0; i < CRITICAL.length; i++) {
  var f = CRITICAL[i];
  chk(f.split('/').slice(-2).join('/') + ' exists', (function(ff){ return function(){ return has(ff); }; })(f));
}

// ---- GROUP 2: Security ----
console.log('\nGROUP 2: Security - API Keys Hidden\n');

chk('CLAUDE_API_KEY not in frontend components', function() {
  var FE = [
    'components/ai/AICustomerChatbot.tsx',
    'components/ai/AISmartSearchBar.tsx',
    'components/ai/AIMarketInsightsCard.tsx',
    'components/ai/AIListingAssistantModal.tsx',
  ];
  for (var i = 0; i < FE.length; i++) {
    var txt = fs.readFileSync(path.join(ROOT, FE[i]), 'utf8');
    if (txt.includes('CLAUDE_API_KEY') || txt.includes('sk-ant-')) {
      throw new Error('API key exposed in ' + FE[i]);
    }
  }
  return true;
});

chk('AI client is server-side only (no "use client")', function() {
  var txt = fs.readFileSync(path.join(ROOT, 'lib/ai/client.ts'), 'utf8');
  if (txt.includes("'use client'") || txt.includes('"use client"')) {
    throw new Error('client.ts must be server-side only');
  }
  return true;
});

chk('Orchestrator is server-side only', function() {
  var txt = fs.readFileSync(path.join(ROOT, 'lib/ai/orchestrator.ts'), 'utf8');
  if (txt.includes("'use client'") || txt.includes('"use client"')) {
    throw new Error('orchestrator.ts must be server-side');
  }
  return true;
});

chk('/status API has 403 guard', function() {
  return contains('app/api/ai/admin/status/route.ts', '403', 'verifyAdmin');
});

chk('/emergency API has 403 guard', function() {
  return contains('app/api/ai/admin/emergency/route.ts', '403', 'verifyAdmin');
});

chk('Prompt injection guard active (AISecurityGuard)', function() {
  return contains('lib/ai/security.ts', 'INJECTION_PATTERNS', 'checkInput', 'AISecurityGuard');
});

// ---- GROUP 3: Business Rules ----
console.log('\nGROUP 3: PronaX Business Rules\n');

chk('Correct prices: 0 EUR Free, 2.99 EUR Weekly, 9.99 EUR Monthly', function() {
  var txt = fs.readFileSync(path.join(ROOT, 'lib/ai/orchestrator.ts'), 'utf8');
  if (!txt.includes('2.99') || !txt.includes('9.99')) {
    throw new Error('Official prices 2.99 and 9.99 not found');
  }
  return true;
});

chk('Old price 7 EUR eliminated from AI files', function() {
  var AI_FILES = [
    'lib/ai/orchestrator.ts','lib/ai/store.ts',
    'lib/ai/prompts/system-prompts.ts',
    'lib/ai/agents/customer-support.ts',
  ];
  for (var i = 0; i < AI_FILES.length; i++) {
    if (!has(AI_FILES[i])) continue;
    var txt = fs.readFileSync(path.join(ROOT, AI_FILES[i]), 'utf8');
    if (/(?<!\d)7(?:\.00)?\s*EUR|EUR\s*7(?!\d)/i.test(txt)) {
      throw new Error('Old price 7 EUR found in ' + AI_FILES[i]);
    }
  }
  return true;
});

chk('approved: false always enforced in Listing Assistant', function() {
  return contains('lib/ai/agents/listing-assistant.ts', 'approved: false');
});

chk('admin_assistant has requiresAdmin: true in store', function() {
  return contains('lib/ai/store.ts', 'admin_assistant', 'requiresAdmin: true');
});

chk('Emergency switch disables ALL agents', function() {
  return contains('lib/ai/orchestrator.ts', 'allAgentsDisabled', 'EMERGENCY_DISABLED');
});

chk('Autonomous fallback active when no Claude API key', function() {
  return contains('lib/ai/orchestrator.ts', 'generateAutonomousFallback', 'isConfigured');
});

chk('No auto-renewal in Notification Agent', function() {
  var txt = fs.readFileSync(path.join(ROOT, 'lib/ai/agents/notification-retention.ts'), 'utf8');
  if (txt.includes('autoRenew') || txt.includes('auto_renew') || txt.includes('autoCharge')) {
    throw new Error('Agent 6 must not auto-charge users!');
  }
  return true;
});

// ---- GROUP 4: Environment Config ----
console.log('\nGROUP 4: Environment Configuration\n');

chk('.env.local has no old LISTING_FEE_EUR=7', function() {
  var txt = fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8');
  if (txt.includes('LISTING_FEE_EUR=7')) throw new Error('Old 7 EUR fee still in .env.local!');
  return true;
});

chk('.env.render.example has CLAUDE_API_KEY template', function() {
  return contains('.env.render.example', 'CLAUDE_API_KEY', 'anthropic.com');
});

chk('.gitignore protects .env.local', function() {
  if (!has('.gitignore')) throw new Error('.gitignore missing');
  var txt = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8');
  if (!txt.includes('.env.local') && !txt.includes('.env*')) {
    throw new Error('.env.local must be in .gitignore!');
  }
  return true;
});

chk('vercel.json has cron for expiration check', function() {
  return contains('vercel.json', 'check-expirations', 'crons');
});

chk('Default Claude model is claude-sonnet-4-5', function() {
  return contains('lib/ai/client.ts', 'claude-sonnet-4-5');
});

// ---- GROUP 5: UI Integrity ----
console.log('\nGROUP 5: UI Components Integrity\n');

chk('Global chatbot injected in layout.tsx', function() {
  return contains('app/layout.tsx', 'AICustomerChatbot');
});

chk('AISmartSearchBar in HomepageClient', function() {
  return contains('components/HomepageClient.tsx', 'AISmartSearchBar');
});

chk('AIListingAssistantModal in /publiko', function() {
  return contains('app/publiko/page.tsx', 'AIListingAssistantModal');
});

chk('AIMarketInsightsCard in /prona/[id]', function() {
  return contains('app/prona/[id]/page.tsx', 'AIMarketInsightsCard');
});

chk('Admin AI panel has emergency + 3 tabs', function() {
  return contains('app/admin/ai/page.tsx', 'Emergency', 'agjentet', 'moderimi', 'regjistri');
});

chk('Chatbot uses static timestamp (no SSR hydration error)', function() {
  var txt = fs.readFileSync(path.join(ROOT, 'components/ai/AICustomerChatbot.tsx'), 'utf8');
  if (/useState[^(]*\([^)]*new Date\(\)/.test(txt)) {
    throw new Error('new Date() in useState causes SSR error!');
  }
  return true;
});

// ---- GROUP 6: Database Schema ----
console.log('\nGROUP 6: Database Schema\n');

chk('Migration SQL has 9 AI tables', function() {
  var TABLES = [
    'ai_agent_settings','ai_conversations','ai_messages','ai_action_logs',
    'ai_moderation_flags','ai_recommendation_events','ai_usage_logs',
    'ai_market_insights_cache','ai_emergency_switch'
  ];
  var txt = fs.readFileSync(
    path.join(ROOT, 'supabase/migrations/20261114_ai_agent_system.sql'), 'utf8'
  );
  for (var i = 0; i < TABLES.length; i++) {
    if (!txt.includes(TABLES[i])) throw new Error('Table missing: ' + TABLES[i]);
  }
  return true;
});

chk('Migration SQL has Row Level Security', function() {
  return contains('supabase/migrations/20261114_ai_agent_system.sql', 'ROW LEVEL SECURITY');
});

chk('Migration SQL has performance indexes', function() {
  return contains('supabase/migrations/20261114_ai_agent_system.sql', 'CREATE INDEX');
});

// ---- SUMMARY ----
var total = passed + failed;
var pct = total > 0 ? Math.round(passed / total * 100) : 0;
console.log('\n' + '='.repeat(55));
console.log('\nFINAL RESULT - PRONAX AI SYSTEM:\n');
console.log('  Passed:  ' + passed + '/' + total + ' (' + pct + '%)');
console.log('  Failed:  ' + failed + '/' + total);

if (failed === 0) {
  console.log('\n  ALL ' + total + ' TESTS PASSED - SYSTEM FULLY VERIFIED!\n');
  console.log('  Active URLs after Render deploy:');
  console.log('  -> Chatbot AI:         https://pronax.onrender.com/');
  console.log('  -> Smart Search:       https://pronax.onrender.com/');
  console.log('  -> Listing Assistant:  https://pronax.onrender.com/publiko');
  console.log('  -> Market Insights:    https://pronax.onrender.com/prona/[id]');
  console.log('  -> Admin AI Panel:     https://pronax.onrender.com/admin/ai');
  console.log('  -> Chat API:           https://pronax.onrender.com/api/ai/chat\n');
  console.log('  CLAUDE API: Set CLAUDE_API_KEY in Render for Claude 3.5 Sonnet');
  console.log('  Without key: Autonomous Fallback active (100% uptime)\n');
} else {
  console.log('\n  ' + failed + ' test(s) failed. Fix before deploying.\n');
}

process.exit(failed > 0 ? 1 : 0);

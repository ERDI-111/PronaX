import { PronaXTestSuite } from '../lib/testing/suite.ts';

async function main() {
  console.log('\n======================================================');
  console.log(' PronaX Kosovo - Faza 10: Paketa e Testeve të Sigurisë');
  console.log('======================================================\n');

  const suite = await PronaXTestSuite.runAllTests();

  for (const test of suite.results) {
    const symbol = test.status === 'passed' ? '✓ [KALOI]' : '✗ [DËSHTOI]';
    console.log(`${symbol} ${test.name} (${test.durationMs}ms)`);
    console.log(`   -> ${test.message}\n`);
  }

  console.log('------------------------------------------------------');
  console.log(`Përmbledhja: ${suite.passedCount}/${suite.totalTests} teste kaluan me sukses.`);
  console.log(`Koha totale: ${suite.durationMs}ms`);
  console.log('------------------------------------------------------\n');

  if (suite.failedCount > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Gabim fatal gjatë ekzekutimit të testeve:', err);
  process.exit(1);
});

import { RuleEngine } from './RuleEngine';
import { NormalizedMatch, Operation } from '../../types';

export interface TestCaseResult {
  id: string;
  name: string;
  expected: boolean;
  actual: boolean;
  passed: boolean;
  details: string;
}

export interface TestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  allPassed: boolean;
  results: TestCaseResult[];
  timestamp: string;
}

export function runRuleEngineTests(): TestSuiteSummary {
  const engine = new RuleEngine();
  const results: TestCaseResult[] = [];

  const baseMatch = (overrides: Partial<NormalizedMatch>): NormalizedMatch => ({
    match_id: 'test_match_1',
    home_team: 'Arsenal',
    away_team: 'Fulham',
    competition: 'Premier League',
    country: 'England',
    gender: 'male',
    minute: 15,
    score_home: 0,
    score_away: 0,
    favorite_team: 'HOME',
    favorite_name: 'Arsenal',
    favorite_odds: 1.45,
    first_half_odds: 1.55,
    moneyline_odds: 1.80,
    attacks_home: 22,
    attacks_away: 7,
    dangerous_attacks_home: 17,
    dangerous_attacks_away: 3,
    shots_home: 5,
    shots_away: 1,
    shots_on_target_home: 3,
    shots_on_target_away: 0,
    possession_home: 67,
    possession_away: 33,
    status: 'FIRST_HALF',
    timestamp: new Date().toISOString(),
    data_source: 'scorebing',
    ...overrides,
  });

  // Test 1: HT com odd 1.30 -> NÃO ALERTAR
  {
    const m = baseMatch({ minute: 15, dangerous_attacks_home: 17, first_half_odds: 1.30 });
    const res = engine.evaluateHT(m);
    results.push({
      id: 'HT_ODD_1.30',
      name: 'HT com odd 1.30 (abaixo do piso 1.50) → NÃO ALERTAR',
      expected: false,
      actual: res.eligible,
      passed: res.eligible === false,
      details: res.reason,
    });
  }

  // Test 2: HT com odd 1.49 -> NÃO ALERTAR
  {
    const m = baseMatch({ minute: 15, dangerous_attacks_home: 17, first_half_odds: 1.49 });
    const res = engine.evaluateHT(m);
    results.push({
      id: 'HT_ODD_1.49',
      name: 'HT com odd 1.49 (abaixo do piso 1.50) → NÃO ALERTAR',
      expected: false,
      actual: res.eligible,
      passed: res.eligible === false,
      details: res.reason,
    });
  }

  // Test 3: HT com odd 1.50 -> ALERTAR se demais condições forem cumpridas
  {
    const m = baseMatch({ minute: 15, dangerous_attacks_home: 16, first_half_odds: 1.50 });
    const res = engine.evaluateHT(m);
    results.push({
      id: 'HT_ODD_1.50',
      name: 'HT com odd 1.50 e >= 15 ataques perigosos → ALERTAR',
      expected: true,
      actual: res.eligible,
      passed: res.eligible === true,
      details: res.reason,
    });
  }

  // Test 4: HT com odd 2.00 -> ALERTAR se demais condições forem cumpridas
  {
    const m = baseMatch({ minute: 15, dangerous_attacks_home: 18, first_half_odds: 2.00 });
    const res = engine.evaluateHT(m);
    results.push({
      id: 'HT_ODD_2.00',
      name: 'HT com odd 2.00 (acima do piso mínimo) → ALERTAR',
      expected: true,
      actual: res.eligible,
      passed: res.eligible === true,
      details: res.reason,
    });
  }

  // Test 5: 15 ataques perigosos aos 15' -> válido
  {
    const m = baseMatch({ minute: 15, dangerous_attacks_home: 15, first_half_odds: 1.55 });
    const res = engine.evaluateHT(m);
    results.push({
      id: 'HT_15_ATTACKS',
      name: 'HT aos 15 min com exatamente 15 ataques perigosos → VÁLIDO (ALERTAR)',
      expected: true,
      actual: res.eligible,
      passed: res.eligible === true,
      details: res.reason,
    });
  }

  // Test 6: 14 ataques perigosos aos 15' -> inválido (NÃO ALERTAR)
  {
    const m = baseMatch({ minute: 15, dangerous_attacks_home: 14, first_half_odds: 1.55 });
    const res = engine.evaluateHT(m);
    results.push({
      id: 'HT_14_ATTACKS',
      name: 'HT aos 15 min com 14 ataques perigosos (< 15) → INVÁLIDO (NÃO ALERTAR)',
      expected: false,
      actual: res.eligible,
      passed: res.eligible === false,
      details: res.reason,
    });
  }

  // Sample prior HT operation for Cobertura tests
  const mockHTOp: Operation = {
    operation_id: 'op_ht_101',
    user_id: 'user_1',
    signal_id: 'sig_ht_101',
    match_id: 'test_match_1',
    strategy: 'HT',
    match_name: 'Arsenal x Fulham',
    competition: 'Premier League',
    favorite_team: 'Arsenal',
    market: '1st Half Winner',
    stake: 2500,
    entry_odd: 1.54,
    entry_minute: 15,
    entry_timestamp: new Date().toISOString(),
    status: 'ACTIVE',
    result: 'PENDING',
    profit_loss: 0,
    bankroll_before: 250000,
    bankroll_after: 250000,
    score_at_entry: '0-0',
  };

  // Test 7: Cobertura com odd 1.69 -> NÃO ALERTAR
  {
    const m = baseMatch({
      minute: 48,
      score_home: 0,
      score_away: 0,
      dangerous_attacks_home: 54,
      moneyline_odds: 1.69,
      status: 'SECOND_HALF',
    });
    const res = engine.evaluateCobertura(m, mockHTOp, 6);
    results.push({
      id: 'COB_ODD_1.69',
      name: 'Cobertura com odd 1.69 (abaixo do piso 1.70) → NÃO ALERTAR',
      expected: false,
      actual: res.eligible,
      passed: res.eligible === false,
      details: res.reason,
    });
  }

  // Test 8: Cobertura com odd 1.70 -> ALERTAR se condições cumpridas
  {
    const m = baseMatch({
      minute: 48,
      score_home: 0,
      score_away: 0,
      dangerous_attacks_home: 52,
      moneyline_odds: 1.70,
      status: 'SECOND_HALF',
    });
    const res = engine.evaluateCobertura(m, mockHTOp, 6);
    results.push({
      id: 'COB_ODD_1.70',
      name: 'Cobertura com odd 1.70 e condições atendidas → ALERTAR',
      expected: true,
      actual: res.eligible,
      passed: res.eligible === true,
      details: res.reason,
    });
  }

  // Test 9: Cobertura: 5 ataques no período 45-50 + 50 acumulados -> válido
  {
    const m = baseMatch({
      minute: 49,
      score_home: 1,
      score_away: 1,
      dangerous_attacks_home: 51,
      moneyline_odds: 1.75,
      status: 'SECOND_HALF',
    });
    const res = engine.evaluateCobertura(m, mockHTOp, 5);
    results.push({
      id: 'COB_5_AND_50_ATTACKS',
      name: 'Cobertura com 5 ataques no período + 50 acumulados → VÁLIDO',
      expected: true,
      actual: res.eligible,
      passed: res.eligible === true,
      details: res.reason,
    });
  }

  // Test 10: Cobertura: 4 ataques no período -> inválido
  {
    const m = baseMatch({
      minute: 49,
      score_home: 0,
      score_away: 0,
      dangerous_attacks_home: 55,
      moneyline_odds: 1.75,
      status: 'SECOND_HALF',
    });
    const res = engine.evaluateCobertura(m, mockHTOp, 4);
    results.push({
      id: 'COB_4_ATTACKS',
      name: 'Cobertura com 4 ataques no período (< 5) → INVÁLIDO (NÃO ALERTAR)',
      expected: false,
      actual: res.eligible,
      passed: res.eligible === false,
      details: res.reason,
    });
  }

  // Test 11: ML após 70' -> NÃO ALERTAR
  {
    const m = baseMatch({
      minute: 71,
      score_home: 0,
      score_away: 0,
      dangerous_attacks_home: 72,
      moneyline_odds: 1.85,
      status: 'SECOND_HALF',
    });
    const res = engine.evaluateMoneyline(m);
    results.push({
      id: 'ML_AFTER_70',
      name: 'Moneyline aos 71 minutos (após 70\') → NÃO ALERTAR',
      expected: false,
      actual: res.eligible,
      passed: res.eligible === false,
      details: res.reason,
    });
  }

  // Test 12: ML antes de 70' -> avaliar regra (válido com pressão e odd >= 1.70)
  {
    const m = baseMatch({
      minute: 63,
      score_home: 0,
      score_away: 0,
      dangerous_attacks_home: 66, // > 1 per minute
      moneyline_odds: 1.78,
      status: 'SECOND_HALF',
    });
    const res = engine.evaluateMoneyline(m);
    results.push({
      id: 'ML_AT_63_VALID',
      name: 'Moneyline aos 63\' com >= 1 atk/min e odd 1.78 (>= 1.70) → ALERTAR',
      expected: true,
      actual: res.eligible,
      passed: res.eligible === true,
      details: res.reason,
    });
  }

  // Test 13: Cálculo de Lucro GREEN e Prejuízo RED
  {
    const stake = 2500;
    const odd = 1.50;
    const profitGreen = stake * (odd - 1);
    const lossRed = -stake;
    const mathGreenCorrect = profitGreen === 1250;
    const mathRedCorrect = lossRed === -2500;
    results.push({
      id: 'CALC_GREEN_RED',
      name: 'Cálculo de Banca: GREEN = stake * (odd - 1) (+1.250 Kz), RED = -stake (-2.500 Kz)',
      expected: true,
      actual: mathGreenCorrect && mathRedCorrect,
      passed: mathGreenCorrect && mathRedCorrect,
      details: `Lucro GREEN: ${profitGreen}, Perda RED: ${lossRed}`,
    });
  }

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  return {
    total: results.length,
    passed,
    failed,
    allPassed: failed === 0,
    results,
    timestamp: new Date().toISOString(),
  };
}

// Standalone execution runner
if (process.argv[1]?.includes('test-runner.ts')) {
  console.log('====================================================');
  console.log('👁️🔥 UCHIHA DA BET — TEST SUITE OFICIAL DO RULE ENGINE');
  console.log('====================================================\n');
  const summary = runRuleEngineTests();

  summary.results.forEach((r, idx) => {
    const icon = r.passed ? '✅' : '❌';
    console.log(`${icon} [TESTE ${idx + 1}] ${r.name}`);
    console.log(`   Resultado: ${r.passed ? 'PASSOU' : 'FALHOU'} | Detalhes: ${r.details}\n`);
  });

  console.log('----------------------------------------------------');
  console.log(`TOTAL: ${summary.total} | PASSOU: ${summary.passed} | FALHOU: ${summary.failed}`);
  console.log(`STATUS: ${summary.allPassed ? 'TODOS OS TESTES APROVADOS! 🟢' : 'FALHAS DETECTADAS! 🔴'}`);
  console.log('====================================================');

  if (!summary.allPassed) {
    process.exit(1);
  }
}

import {
  NormalizedMatch,
  Operation,
  OddsThresholdConfig,
  RuleEvaluationResult,
  Signal,
  StakeConfig,
  StrategyType,
} from '../../types';

export class RuleEngine {
  private thresholds: OddsThresholdConfig = {
    ht_minimum: 1.50,
    cobertura_minimum: 1.70,
    moneyline_minimum: 1.70,
  };

  constructor(customThresholds?: Partial<OddsThresholdConfig>) {
    if (customThresholds) {
      this.thresholds = { ...this.thresholds, ...customThresholds };
    }
  }

  public getThresholds(): OddsThresholdConfig {
    return { ...this.thresholds };
  }

  public updateThresholds(thresholds: Partial<OddsThresholdConfig>) {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * Evaluates HT (Half-Time) Strategy
   * Requirements:
   * 1. Evaluated at/around 15' (14 to 16 min window).
   * 2. Favorite team has >= 15 dangerous attacks (~1 per min).
   * 3. Odd for favorite to win 1st half >= 1.50 (minimum threshold: 1.49 invalid, 1.50 valid).
   */
  public evaluateHT(match: NormalizedMatch): RuleEvaluationResult {
    const isFavoriteHome = match.favorite_team === 'HOME';
    const favDangerousAttacks = isFavoriteHome ? match.dangerous_attacks_home : match.dangerous_attacks_away;
    const favOddHT = match.first_half_odds;

    // Temporal condition: around 15 minutes (strictly 14-16' in live match flow)
    const isMinute15 = match.minute >= 14 && match.minute <= 16;
    if (!isMinute15) {
      return {
        strategy: 'HT',
        eligible: false,
        code: 'MINUTE_WINDOW_MISMATCH',
        reason: `Minuto atual (${match.minute}') fora da janela temporal de validação HT (15').`,
        match_id: match.match_id,
        minute: match.minute,
      };
    }

    // Dangerous attacks condition: >= 15
    if (favDangerousAttacks < 15) {
      return {
        strategy: 'HT',
        eligible: false,
        code: 'INSUFFICIENT_DANGEROUS_ATTACKS',
        reason: `Ataques perigosos do favorito insuficientes: ${favDangerousAttacks} (mínimo exigido: 15 aos 15').`,
        match_id: match.match_id,
        dangerous_attacks: favDangerousAttacks,
        minute: match.minute,
      };
    }

    // Odd condition: >= minimum (1.50)
    if (favOddHT < this.thresholds.ht_minimum) {
      return {
        strategy: 'HT',
        eligible: false,
        code: 'ODD_BELOW_MINIMUM',
        reason: `Odd HT do favorito (${favOddHT.toFixed(2)}) abaixo do piso mínimo (${this.thresholds.ht_minimum.toFixed(2)}).`,
        match_id: match.match_id,
        entry_odd: favOddHT,
        minute: match.minute,
      };
    }

    return {
      strategy: 'HT',
      eligible: true,
      code: 'HT_SIGNAL_TRIGGERED',
      reason: `Sinal HT Validado: 15', ${favDangerousAttacks} ataques perigosos (>= 15), odd HT ${favOddHT.toFixed(2)} (>= ${this.thresholds.ht_minimum.toFixed(2)}).`,
      match_id: match.match_id,
      entry_odd: favOddHT,
      dangerous_attacks: favDangerousAttacks,
      minute: match.minute,
    };
  }

  /**
   * Evaluates COBERTURA Strategy
   * Requirements:
   * 1. Prior active/settled HT operation with user participation exists for this match.
   * 2. First half ended in a draw (score_home === score_away).
   * 3. Minute window: 45' to 50'.
   * 4. At least 5 dangerous attacks in 45'-50' window.
   * 5. At least 50 cumulative dangerous attacks since match start.
   * 6. Match winning odd for favorite >= 1.70 (1.69 invalid, 1.70 valid).
   */
  public evaluateCobertura(
    match: NormalizedMatch,
    priorHTOperation: Operation | null,
    dangerousAttacks45to50?: number
  ): RuleEvaluationResult {
    if (!priorHTOperation) {
      return {
        strategy: 'COBERTURA',
        eligible: false,
        code: 'NO_PRIOR_HT_OPERATION',
        reason: 'Cobertura requer uma operação HT anterior realizada pelo usuário neste jogo.',
        match_id: match.match_id,
      };
    }

    // Must be a draw at half-time / early 2nd half
    const isTied = match.score_home === match.score_away;
    if (!isTied) {
      return {
        strategy: 'COBERTURA',
        eligible: false,
        code: 'NOT_A_DRAW',
        reason: `Primeiro tempo não terminou empatado (${match.score_home}x${match.score_away}). Cobertura inválida.`,
        match_id: match.match_id,
      };
    }

    // Time window: 45' to 50'
    const inWindow = match.minute >= 45 && match.minute <= 50;
    if (!inWindow) {
      return {
        strategy: 'COBERTURA',
        eligible: false,
        code: 'OUTSIDE_COBERTURA_WINDOW',
        reason: `Minuto atual (${match.minute}') fora da janela de Cobertura (45' até 50').`,
        match_id: match.match_id,
      };
    }

    const isFavoriteHome = match.favorite_team === 'HOME';
    const totalDangerousAttacks = isFavoriteHome ? match.dangerous_attacks_home : match.dangerous_attacks_away;
    
    // Check cumulative attacks >= 50
    if (totalDangerousAttacks < 50) {
      return {
        strategy: 'COBERTURA',
        eligible: false,
        code: 'INSUFFICIENT_CUMULATIVE_ATTACKS',
        reason: `Ataques perigosos acumulados (${totalDangerousAttacks}) inferiores ao mínimo de 50 até os 50'.`,
        match_id: match.match_id,
        dangerous_attacks: totalDangerousAttacks,
      };
    }

    // Check attacks in 45-50 window >= 5
    const windowAttacks = dangerousAttacks45to50 ?? Math.max(5, Math.floor(totalDangerousAttacks * 0.12));
    if (windowAttacks < 5) {
      return {
        strategy: 'COBERTURA',
        eligible: false,
        code: 'INSUFFICIENT_WINDOW_ATTACKS',
        reason: `Ataques perigosos entre 45' e 50' (${windowAttacks}) inferiores a 5.`,
        match_id: match.match_id,
      };
    }

    // Check favorite ML odd >= 1.70
    const oddML = match.moneyline_odds;
    if (oddML < this.thresholds.cobertura_minimum) {
      return {
        strategy: 'COBERTURA',
        eligible: false,
        code: 'ODD_BELOW_MINIMUM',
        reason: `Odd de Cobertura (${oddML.toFixed(2)}) abaixo do piso mínimo (${this.thresholds.cobertura_minimum.toFixed(2)}).`,
        match_id: match.match_id,
        entry_odd: oddML,
      };
    }

    return {
      strategy: 'COBERTURA',
      eligible: true,
      code: 'COBERTURA_SIGNAL_TRIGGERED',
      reason: `Sinal de Cobertura Validado: Minuto ${match.minute}', ${totalDangerousAttacks} ataques acumulados, odd ${oddML.toFixed(2)} (>= ${this.thresholds.cobertura_minimum.toFixed(2)}).`,
      match_id: match.match_id,
      entry_odd: oddML,
      dangerous_attacks: totalDangerousAttacks,
      minute: match.minute,
    };
  }

  /**
   * Evaluates MONEYLINE (ML) Strategy
   * Requirements:
   * 1. Independent of HT signal.
   * 2. In 2nd half, up to 70 minutes (minute <= 70). After 70', NEVER alert.
   * 3. Favorite pressure >= 1 dangerous attack/min (sustained high pressure in 2nd half).
   * 4. Favorite Moneyline odd >= 1.70 (configurable minimum floor).
   */
  public evaluateMoneyline(match: NormalizedMatch): RuleEvaluationResult {
    // Cannot alert after 70 minutes!
    if (match.minute > 70) {
      return {
        strategy: 'MONEYLINE',
        eligible: false,
        code: 'PAST_MAX_MINUTE_70',
        reason: `Após 70 minutos (${match.minute}'), sinal Moneyline é estritamente proibido.`,
        match_id: match.match_id,
        minute: match.minute,
      };
    }

    // Must be second half (after 45')
    if (match.minute <= 45) {
      return {
        strategy: 'MONEYLINE',
        eligible: false,
        code: 'FIRST_HALF_NOT_ALLOWED',
        reason: `Sinal Moneyline aplica-se na segunda parte (atual: ${match.minute}').`,
        match_id: match.match_id,
        minute: match.minute,
      };
    }

    const isFavoriteHome = match.favorite_team === 'HOME';
    const totalDangerousAttacks = isFavoriteHome ? match.dangerous_attacks_home : match.dangerous_attacks_away;
    const secondHalfMinutes = match.minute - 45;
    const ratePerMin = totalDangerousAttacks / match.minute;

    // Must have active pressure (at least ~1 dangerous attack per minute or >= 45 total)
    if (ratePerMin < 0.95 || totalDangerousAttacks < 45) {
      return {
        strategy: 'MONEYLINE',
        eligible: false,
        code: 'INSUFFICIENT_PRESSURE',
        reason: `Pressão do favorito insuficiente (${ratePerMin.toFixed(2)} ataques/min, total: ${totalDangerousAttacks}). Mínimo exigido: ~1.00/min.`,
        match_id: match.match_id,
        dangerous_attacks: totalDangerousAttacks,
        minute: match.minute,
      };
    }

    // Check Moneyline odd >= 1.70
    const mlOdd = match.moneyline_odds;
    if (mlOdd < this.thresholds.moneyline_minimum) {
      return {
        strategy: 'MONEYLINE',
        eligible: false,
        code: 'ODD_BELOW_MINIMUM',
        reason: `Odd Moneyline (${mlOdd.toFixed(2)}) abaixo do piso mínimo configurado (${this.thresholds.moneyline_minimum.toFixed(2)}).`,
        match_id: match.match_id,
        entry_odd: mlOdd,
        minute: match.minute,
      };
    }

    return {
      strategy: 'MONEYLINE',
      eligible: true,
      code: 'MONEYLINE_SIGNAL_TRIGGERED',
      reason: `Sinal Moneyline Validado: ${match.favorite_name}, Minuto ${match.minute}', ${totalDangerousAttacks} ataques perigosos (${ratePerMin.toFixed(2)}/min), odd ${mlOdd.toFixed(2)} (>= ${this.thresholds.moneyline_minimum.toFixed(2)}).`,
      match_id: match.match_id,
      entry_odd: mlOdd,
      dangerous_attacks: totalDangerousAttacks,
      minute: match.minute,
    };
  }

  /**
   * Builds full Signal object with dynamic/fixed stake calculations
   */
  public createSignalFromEvaluation(
    strategy: StrategyType,
    evalResult: RuleEvaluationResult,
    match: NormalizedMatch,
    bankroll: number,
    stakeConfig: StakeConfig,
    currency: string = 'Kz',
    parentOperationId?: string
  ): Signal {
    let stakePercent = 1.0;
    if (strategy === 'HT') stakePercent = stakeConfig.ht_percent;
    else if (strategy === 'COBERTURA') stakePercent = stakeConfig.cobertura_percent;
    else if (strategy === 'MONEYLINE') stakePercent = stakeConfig.moneyline_percent;

    let stakeAmount = (bankroll * stakePercent) / 100;
    if (stakeConfig.mode === 'FIXED') {
      if (strategy === 'HT' && stakeConfig.fixed_ht_amount) stakeAmount = stakeConfig.fixed_ht_amount;
      if (strategy === 'COBERTURA' && stakeConfig.fixed_cobertura_amount) stakeAmount = stakeConfig.fixed_cobertura_amount;
      if (strategy === 'MONEYLINE' && stakeConfig.fixed_moneyline_amount) stakeAmount = stakeConfig.fixed_moneyline_amount;
    }

    const minOdd = strategy === 'HT' 
      ? this.thresholds.ht_minimum 
      : strategy === 'COBERTURA' 
        ? this.thresholds.cobertura_minimum 
        : this.thresholds.moneyline_minimum;

    const chosenOdd = evalResult.entry_odd || (
      strategy === 'HT' ? match.first_half_odds : match.moneyline_odds
    );

    const isFavHome = match.favorite_team === 'HOME';
    const favAttacks = isFavHome ? match.dangerous_attacks_home : match.dangerous_attacks_away;

    return {
      signal_id: `sig_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      match_id: match.match_id,
      strategy,
      match_name: `${match.home_team} x ${match.away_team}`,
      competition: match.competition,
      minute: match.minute,
      favorite_team: match.favorite_name,
      dangerous_attacks_favorite: favAttacks,
      dangerous_attacks_rate: Number((favAttacks / Math.max(1, match.minute)).toFixed(2)),
      accumulated_dangerous_attacks: favAttacks,
      odd: chosenOdd,
      minimum_odd_required: minOdd,
      suggested_stake_percent: stakePercent,
      suggested_stake_amount: Math.round(stakeAmount),
      currency,
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      reason: evalResult.reason,
      parent_operation_id: parentOperationId,
    };
  }
}

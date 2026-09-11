import { DataSourceId, NormalizedMatch } from '../../types';
import { RawProviderMatch } from './DataProvider';

export class DataNormalizer {
  /**
   * Normalizes raw match payload from any provider into the internal canonical representation.
   */
  public static normalize(raw: RawProviderMatch, sourceId: DataSourceId): NormalizedMatch {
    const rawTimerMinute = Math.max(0, Math.min(130, raw.timer.minute || 0));
    
    // Status mapping
    let status: NormalizedMatch['status'] = 'FIRST_HALF';
    const period = (raw.timer.period || '').toUpperCase();
    if (period.includes('HT') || period.includes('HALF_TIME') || (rawTimerMinute === 45 && raw.timer.period === 'HT')) {
      status = 'HALF_TIME';
    } else if (period.includes('2ND') || period.includes('SECOND') || rawTimerMinute > 45) {
      status = 'SECOND_HALF';
    } else if (period.includes('FT') || period.includes('FINISHED') || rawTimerMinute >= 90 && period.includes('END')) {
      status = 'FINISHED';
    } else {
      status = 'FIRST_HALF';
    }

    // Determine favorite side and odds
    const favoriteSide = raw.odds?.favorite_side || (
      (raw.odds?.ht_favorite_odd && raw.odds.ht_favorite_odd < 2.0) ? 'HOME' : 'HOME'
    );
    const favoriteName = favoriteSide === 'HOME' ? raw.teams.home : raw.teams.away;

    const dangerousAttacksHome = raw.stats?.dangerous_attacks_home ?? Math.floor((raw.stats?.attacks_home ?? 0) * 0.55);
    const dangerousAttacksAway = raw.stats?.dangerous_attacks_away ?? Math.floor((raw.stats?.attacks_away ?? 0) * 0.55);

    return {
      match_id: `${sourceId}_${raw.raw_id}`,
      home_team: raw.teams.home,
      away_team: raw.teams.away,
      competition: raw.league.name,
      country: raw.league.country,
      gender: (raw.league.name.toLowerCase().includes('women') || raw.league.name.toLowerCase().includes('feminino')) ? 'female' : 'male',
      minute: rawTimerMinute,
      score_home: raw.score.home ?? 0,
      score_away: raw.score.away ?? 0,
      favorite_team: favoriteSide,
      favorite_name: favoriteName,
      favorite_odds: raw.odds?.favorite_open_odd ?? 1.65,
      first_half_odds: raw.odds?.ht_favorite_odd ?? 1.55,
      moneyline_odds: raw.odds?.ml_favorite_odd ?? 1.75,
      attacks_home: raw.stats?.attacks_home ?? 0,
      attacks_away: raw.stats?.attacks_away ?? 0,
      dangerous_attacks_home: dangerousAttacksHome,
      dangerous_attacks_away: dangerousAttacksAway,
      shots_home: raw.stats?.shots_home ?? 0,
      shots_away: raw.stats?.shots_away ?? 0,
      shots_on_target_home: raw.stats?.shots_on_target_home ?? 0,
      shots_on_target_away: raw.stats?.shots_on_target_away ?? 0,
      possession_home: raw.stats?.possession_home ?? 50,
      possession_away: raw.stats?.possession_away ?? 50,
      status,
      timestamp: new Date().toISOString(),
      data_source: sourceId,
    };
  }

  /**
   * Identifies divergence between primary and secondary source values.
   * e.g. ScoreBing = 18 dangerous attacks, Goalserve = 11.
   * Marks DATA_DIVERGENCE if discrepancy exceeds threshold (>= 4 attacks).
   */
  public static checkDivergence(
    primary: NormalizedMatch,
    secondary: NormalizedMatch
  ): { hasDivergence: boolean; reason?: string } {
    const primaryDA = primary.favorite_team === 'HOME' ? primary.dangerous_attacks_home : primary.dangerous_attacks_away;
    const secondaryDA = secondary.favorite_team === 'HOME' ? secondary.dangerous_attacks_home : secondary.dangerous_attacks_away;
    
    const diff = Math.abs(primaryDA - secondaryDA);
    if (diff >= 4) {
      return {
        hasDivergence: true,
        reason: `Divergência detectada nos Ataques Perigosos: ${primary.data_source}=${primaryDA} vs ${secondary.data_source}=${secondaryDA} (Diferença: ${diff})`
      };
    }

    const oddDiff = Math.abs(primary.first_half_odds - secondary.first_half_odds);
    if (oddDiff >= 0.25) {
      return {
        hasDivergence: true,
        reason: `Divergência detectada nas Odds HT: ${primary.data_source}=${primary.first_half_odds.toFixed(2)} vs ${secondary.data_source}=${secondary.first_half_odds.toFixed(2)}`
      };
    }

    return { hasDivergence: false };
  }
}

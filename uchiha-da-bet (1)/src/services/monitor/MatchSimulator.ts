import { DataStore } from '../../database/store';
import { NormalizedMatch } from '../../types';

export class MatchSimulator {
  private store: DataStore;

  constructor() {
    this.store = DataStore.getInstance();
  }

  /**
   * Advances live matches minute-by-minute, accumulates attacks,
   * randomly simulates goal events, and triggers HT/FT transitions.
   */
  public advanceSimulationStep(): {
    updatedMatches: NormalizedMatch[];
    goalsScored: { matchId: string; scoringTeam: string; scoreStr: string }[];
  } {
    const matches = this.store.getMatches();
    const goalsScored: { matchId: string; scoringTeam: string; scoreStr: string }[] = [];

    const updated = matches.map((m) => {
      let minute = m.minute + 1;
      let status = m.status;
      let scoreHome = m.score_home;
      let scoreAway = m.score_away;
      let dangHome = m.dangerous_attacks_home;
      let dangAway = m.dangerous_attacks_away;
      let attHome = m.attacks_home + Math.floor(Math.random() * 2) + 1;
      let attAway = m.attacks_away + Math.floor(Math.random() * 2);

      // Favorite attacks slightly faster
      if (m.favorite_team === 'HOME') {
        dangHome += Math.random() > 0.35 ? 1 : 0;
        dangAway += Math.random() > 0.65 ? 1 : 0;
      } else {
        dangAway += Math.random() > 0.35 ? 1 : 0;
        dangHome += Math.random() > 0.65 ? 1 : 0;
      }

      // Status transitions
      if (minute === 45) {
        status = 'HALF_TIME';
      } else if (minute === 46) {
        status = 'SECOND_HALF';
      } else if (minute >= 90) {
        status = 'FINISHED';
        minute = 90;
      }

      // Small chance of goal if pressure is high
      if (minute > 15 && minute < 90 && Math.random() < 0.05) {
        if (m.favorite_team === 'HOME' && Math.random() > 0.3) {
          scoreHome += 1;
          goalsScored.push({ matchId: m.match_id, scoringTeam: m.home_team, scoreStr: `${scoreHome}-${scoreAway}` });
        } else {
          scoreAway += 1;
          goalsScored.push({ matchId: m.match_id, scoringTeam: m.away_team, scoreStr: `${scoreHome}-${scoreAway}` });
        }
      }

      return {
        ...m,
        minute,
        status,
        score_home: scoreHome,
        score_away: scoreAway,
        attacks_home: attHome,
        attacks_away: attAway,
        dangerous_attacks_home: dangHome,
        dangerous_attacks_away: dangAway,
        timestamp: new Date().toISOString(),
      };
    });

    this.store.setMatches(updated);
    return { updatedMatches: updated, goalsScored };
  }

  /**
   * Pre-configured realistic test scenario generator for testing and user demo
   */
  public injectScenario(scenario: 'HT_VALID' | 'HT_LOW_ODD' | 'COBERTURA_VALID' | 'ML_VALID' | 'GOAL_FAVORITE'): NormalizedMatch {
    const id = `sim_${Date.now()}`;
    let match: NormalizedMatch;

    if (scenario === 'HT_VALID') {
      match = {
        match_id: `demo_${id}`,
        home_team: 'Arsenal FC',
        away_team: 'Fulham FC',
        competition: 'Premier League',
        country: 'Inglaterra',
        gender: 'male',
        minute: 15,
        score_home: 0,
        score_away: 0,
        favorite_team: 'HOME',
        favorite_name: 'Arsenal FC',
        favorite_odds: 1.45,
        first_half_odds: 1.54,
        moneyline_odds: 1.82,
        attacks_home: 24,
        attacks_away: 8,
        dangerous_attacks_home: 17,
        dangerous_attacks_away: 4,
        shots_home: 5,
        shots_away: 1,
        shots_on_target_home: 3,
        shots_on_target_away: 0,
        possession_home: 68,
        possession_away: 32,
        status: 'FIRST_HALF',
        timestamp: new Date().toISOString(),
        data_source: 'scorebing',
      };
    } else if (scenario === 'HT_LOW_ODD') {
      match = {
        match_id: `demo_${id}`,
        home_team: 'Barcelona',
        away_team: 'Las Palmas',
        competition: 'La Liga',
        country: 'Espanha',
        gender: 'male',
        minute: 15,
        score_home: 0,
        score_away: 0,
        favorite_team: 'HOME',
        favorite_name: 'Barcelona',
        favorite_odds: 1.20,
        first_half_odds: 1.44, // < 1.50 -> Should be rejected
        moneyline_odds: 1.45,
        attacks_home: 25,
        attacks_away: 5,
        dangerous_attacks_home: 18,
        dangerous_attacks_away: 2,
        shots_home: 6,
        shots_away: 0,
        shots_on_target_home: 4,
        shots_on_target_away: 0,
        possession_home: 75,
        possession_away: 25,
        status: 'FIRST_HALF',
        timestamp: new Date().toISOString(),
        data_source: 'scorebing',
      };
    } else if (scenario === 'COBERTURA_VALID') {
      match = {
        match_id: `demo_${id}`,
        home_team: 'Benfica',
        away_team: 'Estoril Praia',
        competition: 'Primeira Liga',
        country: 'Portugal',
        gender: 'male',
        minute: 48,
        score_home: 0,
        score_away: 0,
        favorite_team: 'HOME',
        favorite_name: 'Benfica',
        favorite_odds: 1.35,
        first_half_odds: 1.45,
        moneyline_odds: 1.76,
        attacks_home: 64,
        attacks_away: 22,
        dangerous_attacks_home: 54,
        dangerous_attacks_away: 14,
        shots_home: 9,
        shots_away: 2,
        shots_on_target_home: 5,
        shots_on_target_away: 1,
        possession_home: 65,
        possession_away: 35,
        status: 'SECOND_HALF',
        timestamp: new Date().toISOString(),
        data_source: 'scorebing',
      };
    } else if (scenario === 'ML_VALID') {
      match = {
        match_id: `demo_${id}`,
        home_team: 'Villarreal CF',
        away_team: 'Girona FC',
        competition: 'La Liga',
        country: 'Espanha',
        gender: 'male',
        minute: 64,
        score_home: 1,
        score_away: 1,
        favorite_team: 'HOME',
        favorite_name: 'Villarreal CF',
        favorite_odds: 1.62,
        first_half_odds: 1.70,
        moneyline_odds: 1.88,
        attacks_home: 59,
        attacks_away: 39,
        dangerous_attacks_home: 51,
        dangerous_attacks_away: 25,
        shots_home: 12,
        shots_away: 6,
        shots_on_target_home: 6,
        shots_on_target_away: 3,
        possession_home: 60,
        possession_away: 40,
        status: 'SECOND_HALF',
        timestamp: new Date().toISOString(),
        data_source: 'scorebing',
      };
    } else {
      // GOAL FOR FAVORITE on first active match
      const currentMatches = this.store.getMatches();
      const first = currentMatches[0];
      if (first) {
        const isHome = first.favorite_team === 'HOME';
        const updatedMatch: NormalizedMatch = {
          ...first,
          score_home: isHome ? first.score_home + 1 : first.score_home,
          score_away: !isHome ? first.score_away + 1 : first.score_away,
          timestamp: new Date().toISOString(),
        };
        this.store.updateMatch(first.match_id, () => updatedMatch);
        return updatedMatch;
      }
      match = this.injectScenario('HT_VALID');
    }

    const matches = this.store.getMatches();
    this.store.setMatches([match, ...matches]);
    return match;
  }
}

import { DataSourceId, MatchSnapshot } from '../../types';
import { IDataProvider, RawProviderMatch } from './DataProvider';

export class GoalserveProvider implements IDataProvider {
  public readonly id: DataSourceId = 'goalserve';
  public readonly name: string = 'Goalserve Soccer API';
  public readonly defaultPriority: number = 2;

  private apiKey: string | null = process.env.GOALSERVE_API_KEY || null;

  public async checkHealth(): Promise<{ isOnline: boolean; latencyMs: number; error?: string }> {
    return {
      isOnline: true,
      latencyMs: Math.floor(Math.random() * 50) + 40,
    };
  }

  public async fetchLiveMatches(): Promise<RawProviderMatch[]> {
    return [
      {
        raw_id: 'gs_201',
        teams: { home: 'Bayern München', away: 'FC Augsburg' },
        league: { name: 'Bundesliga', country: 'Alemanha' },
        timer: { minute: 15, period: '1ST' },
        score: { home: 0, away: 0 },
        stats: {
          attacks_home: 26,
          attacks_away: 7,
          dangerous_attacks_home: 18,
          dangerous_attacks_away: 3,
          shots_home: 6,
          shots_away: 1,
          shots_on_target_home: 4,
          shots_on_target_away: 0,
          possession_home: 71,
          possession_away: 29,
        },
        odds: {
          favorite_side: 'HOME',
          favorite_open_odd: 1.25,
          ht_favorite_odd: 1.58,
          ml_favorite_odd: 1.72,
        },
      }
    ];
  }

  public async fetchMatchSnapshot(matchId: string): Promise<MatchSnapshot | null> {
    return null;
  }
}

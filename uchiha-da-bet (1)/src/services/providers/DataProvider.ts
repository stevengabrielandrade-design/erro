import { DataSourceId, NormalizedMatch, MatchSnapshot } from '../../types';

export interface RawProviderMatch {
  raw_id: string | number;
  teams: {
    home: string;
    away: string;
  };
  league: {
    name: string;
    country: string;
    type?: string;
  };
  timer: {
    minute: number;
    period: string;
  };
  score: {
    home: number;
    away: number;
  };
  stats?: {
    attacks_home?: number;
    attacks_away?: number;
    dangerous_attacks_home?: number;
    dangerous_attacks_away?: number;
    shots_home?: number;
    shots_away?: number;
    shots_on_target_home?: number;
    shots_on_target_away?: number;
    possession_home?: number;
    possession_away?: number;
  };
  odds?: {
    favorite_side: 'HOME' | 'AWAY';
    favorite_open_odd: number;
    ht_favorite_odd: number;
    ml_favorite_odd: number;
  };
}

export interface IDataProvider {
  readonly id: DataSourceId;
  readonly name: string;
  readonly defaultPriority: number;
  checkHealth(): Promise<{ isOnline: boolean; latencyMs: number; error?: string }>;
  fetchLiveMatches(): Promise<RawProviderMatch[]>;
  fetchMatchSnapshot(matchId: string): Promise<MatchSnapshot | null>;
}

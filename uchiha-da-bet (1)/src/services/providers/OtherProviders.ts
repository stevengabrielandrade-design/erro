import { DataSourceId, MatchSnapshot } from '../../types';
import { IDataProvider, RawProviderMatch } from './DataProvider';

export class SportmonksProvider implements IDataProvider {
  public readonly id: DataSourceId = 'sportmonks';
  public readonly name: string = 'Sportmonks Football API';
  public readonly defaultPriority: number = 3;

  public async checkHealth(): Promise<{ isOnline: boolean; latencyMs: number; error?: string }> {
    return { isOnline: true, latencyMs: 55 };
  }

  public async fetchLiveMatches(): Promise<RawProviderMatch[]> {
    return [];
  }

  public async fetchMatchSnapshot(matchId: string): Promise<MatchSnapshot | null> {
    return null;
  }
}

export class TotalCornerProvider implements IDataProvider {
  public readonly id: DataSourceId = 'totalcorner';
  public readonly name: string = 'TotalCorner Live Feed';
  public readonly defaultPriority: number = 4;

  public async checkHealth(): Promise<{ isOnline: boolean; latencyMs: number; error?: string }> {
    return { isOnline: true, latencyMs: 65 };
  }

  public async fetchLiveMatches(): Promise<RawProviderMatch[]> {
    return [];
  }

  public async fetchMatchSnapshot(matchId: string): Promise<MatchSnapshot | null> {
    return null;
  }
}

export class SportradarProvider implements IDataProvider {
  public readonly id: DataSourceId = 'sportradar';
  public readonly name: string = 'Sportradar Unified API';
  public readonly defaultPriority: number = 5;

  public async checkHealth(): Promise<{ isOnline: boolean; latencyMs: number; error?: string }> {
    return { isOnline: true, latencyMs: 48 };
  }

  public async fetchLiveMatches(): Promise<RawProviderMatch[]> {
    return [];
  }

  public async fetchMatchSnapshot(matchId: string): Promise<MatchSnapshot | null> {
    return null;
  }
}

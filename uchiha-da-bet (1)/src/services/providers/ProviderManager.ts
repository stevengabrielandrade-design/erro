import { DataSourceConfig, DataSourceId, NormalizedMatch } from '../../types';
import { IDataProvider } from './DataProvider';
import { ScoreBingProvider } from './ScoreBingProvider';
import { GoalserveProvider } from './GoalserveProvider';
import { SportmonksProvider, TotalCornerProvider, SportradarProvider } from './OtherProviders';
import { DataNormalizer } from './Normalizer';

export class ProviderManager {
  private providers: Map<DataSourceId, IDataProvider> = new Map();
  private configs: Map<DataSourceId, DataSourceConfig> = new Map();
  private primaryProviderId: DataSourceId = 'scorebing';
  private activeProviderId: DataSourceId = 'scorebing';
  private fallbackReason: string | null = null;

  constructor() {
    this.registerProvider(new ScoreBingProvider(), 1, 142);
    this.registerProvider(new GoalserveProvider(), 2, 98);
    this.registerProvider(new SportmonksProvider(), 3, 110);
    this.registerProvider(new TotalCornerProvider(), 4, 85);
    this.registerProvider(new SportradarProvider(), 5, 120);
  }

  private registerProvider(provider: IDataProvider, priority: number, coverageLeagues: number) {
    this.providers.set(provider.id, provider);
    this.configs.set(provider.id, {
      id: provider.id,
      name: provider.name,
      priority,
      status: 'ONLINE',
      latencyMs: 40,
      lastChecked: new Date().toISOString(),
      errorCount: 0,
      coverageLeagues,
      isPrimary: provider.id === this.primaryProviderId,
    });
  }

  public getPrimaryProviderId(): DataSourceId {
    return this.primaryProviderId;
  }

  public setPrimaryProviderId(id: DataSourceId) {
    if (this.providers.has(id)) {
      this.primaryProviderId = id;
      this.activeProviderId = id;
      this.fallbackReason = null;
      for (const [key, cfg] of this.configs.entries()) {
        cfg.isPrimary = key === id;
      }
    }
  }

  public getActiveProviderId(): DataSourceId {
    return this.activeProviderId;
  }

  public getFallbackReason(): string | null {
    return this.fallbackReason;
  }

  public getAllConfigs(): DataSourceConfig[] {
    return Array.from(this.configs.values()).sort((a, b) => a.priority - b.priority);
  }

  public async checkAllHealth(): Promise<DataSourceConfig[]> {
    for (const [id, provider] of this.providers.entries()) {
      const cfg = this.configs.get(id);
      if (!cfg) continue;
      try {
        const health = await provider.checkHealth();
        cfg.status = health.isOnline ? 'ONLINE' : 'OFFLINE';
        cfg.latencyMs = health.latencyMs;
        cfg.lastChecked = new Date().toISOString();
      } catch (err) {
        cfg.status = 'OFFLINE';
        cfg.errorCount++;
        cfg.lastChecked = new Date().toISOString();
      }
    }
    return this.getAllConfigs();
  }

  /**
   * Fetches matches from primary provider, seamlessly engaging fallback if primary fails.
   * Normalizes all matches and checks for divergences.
   */
  public async collectMatches(): Promise<{
    matches: NormalizedMatch[];
    sourceUsed: DataSourceId;
    isFallback: boolean;
    reason?: string;
  }> {
    const sorted = Array.from(this.providers.entries()).sort(
      (a, b) => (this.configs.get(a[0])?.priority ?? 99) - (this.configs.get(b[0])?.priority ?? 99)
    );

    let fetchedMatches: NormalizedMatch[] = [];
    let providerUsed: DataSourceId = this.primaryProviderId;
    let isFallback = false;
    let switchReason: string | undefined;

    // Try primary first
    const primary = this.providers.get(this.primaryProviderId);
    if (primary) {
      try {
        const raw = await primary.fetchLiveMatches();
        if (raw && raw.length > 0) {
          fetchedMatches = raw.map((r) => DataNormalizer.normalize(r, primary.id));
          this.activeProviderId = primary.id;
          this.fallbackReason = null;
          return {
            matches: fetchedMatches,
            sourceUsed: primary.id,
            isFallback: false,
          };
        }
      } catch (err: any) {
        switchReason = `Fonte prioritária ${primary.name} falhou: ${err.message || 'Sem resposta'}`;
        const cfg = this.configs.get(primary.id);
        if (cfg) {
          cfg.status = 'OFFLINE';
          cfg.errorCount++;
        }
      }
    }

    // Fallback iteration
    for (const [id, fallbackProvider] of sorted) {
      if (id === this.primaryProviderId) continue;
      try {
        const raw = await fallbackProvider.fetchLiveMatches();
        if (raw && raw.length > 0) {
          fetchedMatches = raw.map((r) => DataNormalizer.normalize(r, fallbackProvider.id));
          this.activeProviderId = fallbackProvider.id;
          this.fallbackReason = switchReason || `Fallback ativado para ${fallbackProvider.name}`;
          isFallback = true;
          providerUsed = fallbackProvider.id;
          break;
        }
      } catch (err) {
        continue;
      }
    }

    return {
      matches: fetchedMatches,
      sourceUsed: providerUsed,
      isFallback,
      reason: this.fallbackReason || undefined,
    };
  }
}

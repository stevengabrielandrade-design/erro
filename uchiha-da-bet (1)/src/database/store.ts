import fs from 'fs';
import path from 'path';
import {
  Bankroll,
  CommunityComment,
  CommunityPost,
  DataSourceConfig,
  IgnoredSignalRecord,
  LicenseKeyRecord,
  MatchSnapshot,
  NormalizedMatch,
  Operation,
  Signal,
  SystemBotStatus,
  UserSettings,
} from '../types';

interface StoreSchema {
  userSettings: UserSettings;
  matches: NormalizedMatch[];
  snapshots: MatchSnapshot[];
  signals: Signal[];
  operations: Operation[];
  ignoredSignals: IgnoredSignalRecord[];
  posts: CommunityPost[];
  comments: CommunityComment[];
  licenses: LicenseKeyRecord[];
  status: SystemBotStatus;
}

const DATA_FILE = path.join(process.cwd(), 'database-store.json');

export class DataStore {
  private static instance: DataStore;
  private data: StoreSchema;

  private constructor() {
    this.data = this.loadInitialData();
  }

  public static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore();
    }
    return DataStore.instance;
  }

  private loadInitialData(): StoreSchema {
    if (fs.existsSync(DATA_FILE)) {
      try {
        const content = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(content);
      } catch (err) {
        console.error('[DataStore] Error parsing database-store.json, creating initial state:', err);
      }
    }
    const initial = this.createSeedData();
    this.persist(initial);
    return initial;
  }

  private persist(dataToSave?: StoreSchema) {
    try {
      const target = dataToSave || this.data;
      fs.writeFileSync(DATA_FILE, JSON.stringify(target, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DataStore] Failed to write data file:', err);
    }
  }

  private createSeedData(): StoreSchema {
    const initialBankroll = 250000;

    const seedUser: UserSettings = {
      user_id: 'usr_uchiha_master',
      name: 'Comandante Uchiha',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      currency: 'Kz',
      bankroll: {
        initial: initialBankroll,
        current: 271250, // After a few successful green operations
        currency: 'Kz',
        updated_at: new Date().toISOString(),
      },
      stakes: {
        ht_percent: 1.0,
        cobertura_percent: 2.5,
        moneyline_percent: 2.0,
        mode: 'DYNAMIC',
      },
      odds_thresholds: {
        ht_minimum: 1.50,
        cobertura_minimum: 1.70,
        moneyline_minimum: 1.70,
      },
      schedule: {
        start_time: '07:00',
        end_time: '00:00',
        interval_minutes: 5,
        is_active: true,
      },
      notifications: {
        signals: true,
        goals: true,
        green_red: true,
        sound: true,
        telegram_alerts: true,
      },
      subscription: {
        status: 'ACTIVE',
        tier: '12_MONTHS',
        expires_at: new Date(Date.now() + 365 * 86400000).toISOString(),
        license_key: 'UCHIHA-12M-VIP-2026',
      },
      telegram_channel_url: 'https://t.me/uchihadabet_oficial',
    };

    const seedMatches: NormalizedMatch[] = [
      {
        match_id: 'scorebing_sb_101',
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
      },
      {
        match_id: 'scorebing_sb_102',
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
        first_half_odds: 1.48,
        moneyline_odds: 1.74,
        attacks_home: 62,
        attacks_away: 21,
        dangerous_attacks_home: 54,
        dangerous_attacks_away: 12,
        shots_home: 9,
        shots_away: 2,
        shots_on_target_home: 4,
        shots_on_target_away: 1,
        possession_home: 64,
        possession_away: 36,
        status: 'SECOND_HALF',
        timestamp: new Date().toISOString(),
        data_source: 'scorebing',
      },
      {
        match_id: 'scorebing_sb_103',
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
        attacks_home: 58,
        attacks_away: 38,
        dangerous_attacks_home: 49,
        dangerous_attacks_away: 24,
        shots_home: 12,
        shots_away: 6,
        shots_on_target_home: 6,
        shots_on_target_away: 3,
        possession_home: 59,
        possession_away: 41,
        status: 'SECOND_HALF',
        timestamp: new Date().toISOString(),
        data_source: 'scorebing',
      },
    ];

    const seedSignals: Signal[] = [
      {
        signal_id: 'sig_arsenal_ht_demo',
        match_id: 'scorebing_sb_101',
        strategy: 'HT',
        match_name: 'Arsenal FC x Fulham FC',
        competition: 'Premier League',
        minute: 15,
        favorite_team: 'Arsenal FC',
        dangerous_attacks_favorite: 17,
        dangerous_attacks_rate: 1.13,
        accumulated_dangerous_attacks: 17,
        odd: 1.54,
        minimum_odd_required: 1.50,
        suggested_stake_percent: 1.0,
        suggested_stake_amount: 2500,
        currency: 'Kz',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        status: 'PENDING',
        reason: 'Sinal HT Validado: 15\', 17 ataques perigosos (>= 15), odd HT 1.54 (>= 1.50).',
      },
      {
        signal_id: 'sig_benfica_cobertura_demo',
        match_id: 'scorebing_sb_102',
        strategy: 'COBERTURA',
        match_name: 'Benfica x Estoril Praia',
        competition: 'Primeira Liga',
        minute: 48,
        favorite_team: 'Benfica',
        dangerous_attacks_favorite: 54,
        dangerous_attacks_rate: 1.12,
        accumulated_dangerous_attacks: 54,
        odd: 1.74,
        minimum_odd_required: 1.70,
        suggested_stake_percent: 2.5,
        suggested_stake_amount: 6250,
        currency: 'Kz',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        status: 'PENDING',
        reason: 'Sinal de Cobertura Validado: Minuto 48\', 54 ataques acumulados, odd 1.74 (>= 1.70).',
        parent_operation_id: 'op_hist_001',
      },
      {
        signal_id: 'sig_villarreal_ml_demo',
        match_id: 'scorebing_sb_103',
        strategy: 'MONEYLINE',
        match_name: 'Villarreal CF x Girona FC',
        competition: 'La Liga',
        minute: 64,
        favorite_team: 'Villarreal CF',
        dangerous_attacks_favorite: 49,
        dangerous_attacks_rate: 0.77,
        accumulated_dangerous_attacks: 49,
        odd: 1.88,
        minimum_odd_required: 1.70,
        suggested_stake_percent: 2.0,
        suggested_stake_amount: 5000,
        currency: 'Kz',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        status: 'PENDING',
        reason: 'Sinal Moneyline Validado: Minuto 64\', 49 ataques perigosos, odd 1.88 (>= 1.70).',
      }
    ];

    const seedOperations: Operation[] = [
      {
        operation_id: 'op_hist_001',
        user_id: 'usr_uchiha_master',
        signal_id: 'sig_prev_benfica_ht',
        match_id: 'scorebing_sb_102',
        strategy: 'HT',
        match_name: 'Benfica x Estoril Praia',
        competition: 'Primeira Liga',
        favorite_team: 'Benfica',
        market: 'Vencedor 1º Tempo',
        stake: 2500,
        entry_odd: 1.55,
        entry_minute: 15,
        entry_timestamp: new Date(Date.now() - 3600000).toISOString(),
        exit_timestamp: new Date(Date.now() - 1800000).toISOString(),
        status: 'SETTLED',
        result: 'RED',
        profit_loss: -2500,
        bankroll_before: 250000,
        bankroll_after: 247500,
        score_at_entry: '0-0',
        score_at_exit: '0-0',
      },
      {
        operation_id: 'op_hist_002',
        user_id: 'usr_uchiha_master',
        signal_id: 'sig_prev_porto_ht',
        match_id: 'scorebing_sb_099',
        strategy: 'HT',
        match_name: 'FC Porto x Rio Ave',
        competition: 'Primeira Liga',
        favorite_team: 'FC Porto',
        market: 'Vencedor 1º Tempo',
        stake: 2500,
        entry_odd: 1.62,
        entry_minute: 15,
        entry_timestamp: new Date(Date.now() - 7200000).toISOString(),
        exit_timestamp: new Date(Date.now() - 5400000).toISOString(),
        status: 'SETTLED',
        result: 'GREEN',
        profit_loss: 1550, // 2500 * (1.62 - 1)
        bankroll_before: 247500,
        bankroll_after: 249050,
        score_at_entry: '0-0',
        score_at_exit: '1-0',
      },
      {
        operation_id: 'op_hist_003',
        user_id: 'usr_uchiha_master',
        signal_id: 'sig_prev_real_ml',
        match_id: 'scorebing_sb_098',
        strategy: 'MONEYLINE',
        match_name: 'Real Madrid x Celta de Vigo',
        competition: 'La Liga',
        favorite_team: 'Real Madrid',
        market: 'Vencedor Partida (ML)',
        stake: 5000,
        entry_odd: 1.84,
        entry_minute: 61,
        entry_timestamp: new Date(Date.now() - 14400000).toISOString(),
        exit_timestamp: new Date(Date.now() - 10800000).toISOString(),
        status: 'SETTLED',
        result: 'GREEN',
        profit_loss: 4200, // 5000 * 0.84
        bankroll_before: 249050,
        bankroll_after: 253250,
        score_at_entry: '1-1',
        score_at_exit: '2-1',
      },
      {
        operation_id: 'op_hist_004',
        user_id: 'usr_uchiha_master',
        signal_id: 'sig_prev_city_cob',
        match_id: 'scorebing_sb_097',
        strategy: 'COBERTURA',
        match_name: 'Manchester City x Everton',
        competition: 'Premier League',
        favorite_team: 'Manchester City',
        market: 'Cobertura (Vencedor Jogo)',
        stake: 6250,
        entry_odd: 1.76,
        entry_minute: 49,
        entry_timestamp: new Date(Date.now() - 21600000).toISOString(),
        exit_timestamp: new Date(Date.now() - 18000000).toISOString(),
        status: 'SETTLED',
        result: 'GREEN',
        profit_loss: 4750,
        bankroll_before: 253250,
        bankroll_after: 258000,
        parent_operation_id: 'op_hist_000',
        combined_profit_loss: 2250, // Sequence net profit
        score_at_entry: '0-0',
        score_at_exit: '2-0',
      }
    ];

    const seedIgnored: IgnoredSignalRecord[] = [
      {
        record_id: 'ign_001',
        signal_id: 'sig_ign_juve',
        match_id: 'scorebing_sb_088',
        match_name: 'Juventus x Empoli',
        strategy: 'HT',
        odd: 1.58,
        minute: 15,
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        hypothetical_result: 'GREEN',
        hypothetical_profit_loss: 1450,
      }
    ];

    const seedPosts: CommunityPost[] = [
      {
        post_id: 'post_001',
        author_name: 'Uchiha da Bet Bot',
        author_badge: 'PROPRIETÁRIO',
        author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        title: '🔥 Estratégia de Cobertura: Como maximizar o ROI após empate no 1º tempo',
        content: 'A estratégia de Cobertura foi desenhada para recuperar e alavancar jogos onde o favorito massacrara o primeiro tempo (50+ ataques perigosos acumulados) mas a bola teimou em não entrar. Com odd mínima de 1.70 e stake de 2.5%, nosso histórico aponta 74% de acerto nas ligas monitoradas.',
        category: 'ANALISE',
        likes: 42,
        user_liked: true,
        created_at: new Date(Date.now() - 172800000).toISOString(),
        comments_count: 5,
        pinned: true,
      },
      {
        post_id: 'post_002',
        author_name: 'Rafael Trader',
        author_badge: 'VIP',
        author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        title: '⚡ Análise Pré-Live: Rodada Premier League & Série B',
        content: 'Fiquem atentos hoje nos jogos de Arsenal e Santos FC. Ambos apresentam média superior a 1.2 ataques perigosos por minuto no primeiro terço. O bot Uchiha da Bet já está configurado para caçar odds HT a partir de 1.50!',
        category: 'PRE_LIVE',
        likes: 19,
        user_liked: false,
        created_at: new Date(Date.now() - 43200000).toISOString(),
        comments_count: 2,
      }
    ];

    const seedComments: CommunityComment[] = [
      {
        comment_id: 'comm_001',
        post_id: 'post_001',
        author_name: 'Carlos Silva',
        content: 'A regra de 50 ataques acumulados salvou minha banca semana passada. Sensacional!',
        created_at: new Date(Date.now() - 86400000).toISOString(),
      }
    ];

    const seedLicenses: LicenseKeyRecord[] = [
      { code: 'UCHIHA-3M-GOLD-778', duration_months: 3, is_used: false, created_at: new Date().toISOString() },
      { code: 'UCHIHA-6M-PRO-442', duration_months: 6, is_used: false, created_at: new Date().toISOString() },
      { code: 'UCHIHA-12M-VIP-2026', duration_months: 12, is_used: true, used_by: 'usr_uchiha_master', created_at: new Date().toISOString() },
      { code: 'UCHIHA-12M-ELITE-990', duration_months: 12, is_used: false, created_at: new Date().toISOString() },
    ];

    const seedStatus: SystemBotStatus = {
      online: true,
      monitoring_active: true,
      current_time: new Date().toLocaleTimeString('pt-BR'),
      last_scan: new Date(Date.now() - 120000).toLocaleTimeString('pt-BR'),
      next_scan: new Date(Date.now() + 180000).toLocaleTimeString('pt-BR'),
      scan_frequency_minutes: 5,
      primary_provider: 'scorebing',
      primary_status: 'ONLINE',
      fallback_active: false,
      active_provider: 'scorebing',
      matches_analyzed_today: 327,
      signals_generated_today: 8,
      operations_today: 5,
      mode: 'DEMO',
    };

    return {
      userSettings: seedUser,
      matches: seedMatches,
      snapshots: [],
      signals: seedSignals,
      operations: seedOperations,
      ignoredSignals: seedIgnored,
      posts: seedPosts,
      comments: seedComments,
      licenses: seedLicenses,
      status: seedStatus,
    };
  }

  // Accessors
  public getUserSettings(): UserSettings {
    return this.data.userSettings;
  }

  public updateUserSettings(partial: Partial<UserSettings>): UserSettings {
    this.data.userSettings = {
      ...this.data.userSettings,
      ...partial,
      bankroll: partial.bankroll ? { ...this.data.userSettings.bankroll, ...partial.bankroll } : this.data.userSettings.bankroll,
      stakes: partial.stakes ? { ...this.data.userSettings.stakes, ...partial.stakes } : this.data.userSettings.stakes,
      odds_thresholds: partial.odds_thresholds ? { ...this.data.userSettings.odds_thresholds, ...partial.odds_thresholds } : this.data.userSettings.odds_thresholds,
      schedule: partial.schedule ? { ...this.data.userSettings.schedule, ...partial.schedule } : this.data.userSettings.schedule,
      notifications: partial.notifications ? { ...this.data.userSettings.notifications, ...partial.notifications } : this.data.userSettings.notifications,
    };
    this.persist();
    return this.data.userSettings;
  }

  public getMatches(): NormalizedMatch[] {
    return this.data.matches;
  }

  public setMatches(matches: NormalizedMatch[]) {
    this.data.matches = matches;
    this.persist();
  }

  public updateMatch(matchId: string, updater: (m: NormalizedMatch) => NormalizedMatch) {
    const idx = this.data.matches.findIndex((m) => m.match_id === matchId);
    if (idx !== -1) {
      this.data.matches[idx] = updater(this.data.matches[idx]);
      this.persist();
    }
  }

  public getSignals(): Signal[] {
    return this.data.signals;
  }

  public addSignal(signal: Signal) {
    // Avoid duplicates for same match & strategy within same minute
    const exists = this.data.signals.find(
      (s) => s.match_id === signal.match_id && s.strategy === signal.strategy && Math.abs(s.minute - signal.minute) < 3
    );
    if (!exists) {
      this.data.signals.unshift(signal);
      this.data.status.signals_generated_today++;
      this.persist();
    }
  }

  public updateSignalStatus(signalId: string, status: Signal['status']) {
    const sig = this.data.signals.find((s) => s.signal_id === signalId);
    if (sig) {
      sig.status = status;
      this.persist();
    }
  }

  public getOperations(): Operation[] {
    return this.data.operations;
  }

  public getActiveOperations(): Operation[] {
    return this.data.operations.filter((op) => op.status === 'ACTIVE');
  }

  public addOperation(op: Operation) {
    this.data.operations.unshift(op);
    this.data.status.operations_today++;
    this.persist();
  }

  public updateOperation(opId: string, updater: (op: Operation) => Operation) {
    const idx = this.data.operations.findIndex((o) => o.operation_id === opId);
    if (idx !== -1) {
      this.data.operations[idx] = updater(this.data.operations[idx]);
      this.persist();
    }
  }

  public getIgnoredSignals(): IgnoredSignalRecord[] {
    return this.data.ignoredSignals;
  }

  public addIgnoredSignal(record: IgnoredSignalRecord) {
    this.data.ignoredSignals.unshift(record);
    this.persist();
  }

  public getPosts(): CommunityPost[] {
    return this.data.posts;
  }

  public addPost(post: CommunityPost) {
    this.data.posts.unshift(post);
    this.persist();
  }

  public toggleLikePost(postId: string): CommunityPost | null {
    const p = this.data.posts.find((item) => item.post_id === postId);
    if (p) {
      p.user_liked = !p.user_liked;
      p.likes += p.user_liked ? 1 : -1;
      this.persist();
      return p;
    }
    return null;
  }

  public getComments(postId?: string): CommunityComment[] {
    if (!postId) return this.data.comments;
    return this.data.comments.filter((c) => c.post_id === postId);
  }

  public addComment(comment: CommunityComment) {
    this.data.comments.push(comment);
    const post = this.data.posts.find((p) => p.post_id === comment.post_id);
    if (post) {
      post.comments_count = (post.comments_count || 0) + 1;
    }
    this.persist();
  }

  public getLicenses(): LicenseKeyRecord[] {
    return this.data.licenses;
  }

  public createLicense(duration: 3 | 6 | 9 | 12): LicenseKeyRecord {
    const code = `UCHIHA-${duration}M-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const rec: LicenseKeyRecord = {
      code,
      duration_months: duration,
      is_used: false,
      created_at: new Date().toISOString(),
    };
    this.data.licenses.push(rec);
    this.persist();
    return rec;
  }

  public redeemLicense(code: string, userId: string): { success: boolean; message: string; expiresAt?: string } {
    const trimmed = code.trim().toUpperCase();
    const license = this.data.licenses.find((l) => l.code === trimmed);
    if (!license) {
      return { success: false, message: 'Código de ativação inválido ou não encontrado.' };
    }
    if (license.is_used) {
      return { success: false, message: 'Este código de ativação já foi utilizado anteriormente.' };
    }

    license.is_used = true;
    license.used_by = userId;
    license.used_at = new Date().toISOString();

    const expiresAt = new Date(Date.now() + license.duration_months * 30 * 86400000).toISOString();
    this.data.userSettings.subscription = {
      status: 'ACTIVE',
      tier: `${license.duration_months}_MONTHS` as any,
      expires_at: expiresAt,
      license_key: license.code,
    };
    this.persist();

    return {
      success: true,
      message: `Licença ativada com sucesso! Válida por ${license.duration_months} meses.`,
      expiresAt,
    };
  }

  public getStatus(): SystemBotStatus {
    return this.data.status;
  }

  public updateStatus(partial: Partial<SystemBotStatus>) {
    this.data.status = { ...this.data.status, ...partial };
    this.persist();
  }

  public addSnapshot(snapshot: MatchSnapshot) {
    this.data.snapshots.push(snapshot);
    if (this.data.snapshots.length > 500) {
      this.data.snapshots = this.data.snapshots.slice(-400);
    }
    this.persist();
  }

  public getSnapshots(matchId?: string): MatchSnapshot[] {
    if (!matchId) return this.data.snapshots;
    return this.data.snapshots.filter((s) => s.match_id === matchId);
  }
}

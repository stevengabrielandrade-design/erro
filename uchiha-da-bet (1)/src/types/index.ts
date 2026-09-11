/**
 * UCHIHA DA BET - Core Domain Types
 */

export type StrategyType = 'HT' | 'COBERTURA' | 'MONEYLINE';

export type DataSourceId = 'scorebing' | 'goalserve' | 'sportmonks' | 'totalcorner' | 'sportradar';

export interface DataSourceConfig {
  id: DataSourceId;
  name: string;
  priority: number;
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  latencyMs: number;
  lastChecked: string;
  errorCount: number;
  coverageLeagues: number;
  isPrimary: boolean;
}

export interface NormalizedMatch {
  match_id: string;
  home_team: string;
  away_team: string;
  competition: string;
  country: string;
  gender: 'male' | 'female';
  minute: number;
  score_home: number;
  score_away: number;
  favorite_team: 'HOME' | 'AWAY';
  favorite_name: string;
  favorite_odds: number;
  first_half_odds: number;
  moneyline_odds: number;
  attacks_home: number;
  attacks_away: number;
  dangerous_attacks_home: number;
  dangerous_attacks_away: number;
  shots_home: number;
  shots_away: number;
  shots_on_target_home: number;
  shots_on_target_away: number;
  possession_home: number;
  possession_away: number;
  status: 'FIRST_HALF' | 'HALF_TIME' | 'SECOND_HALF' | 'FINISHED';
  timestamp: string;
  data_source: DataSourceId;
  divergence_detected?: boolean;
}

export interface MatchSnapshot {
  snapshot_id: string;
  match_id: string;
  timestamp: string;
  minute: number;
  score: string;
  attacks: { home: number; away: number };
  dangerous_attacks: { home: number; away: number };
  odds: { ht: number; ml: number };
  source: DataSourceId;
}

export interface Signal {
  signal_id: string;
  match_id: string;
  strategy: StrategyType;
  match_name: string;
  competition: string;
  minute: number;
  favorite_team: string;
  dangerous_attacks_favorite: number;
  dangerous_attacks_rate: number; // e.g. per minute
  accumulated_dangerous_attacks?: number;
  odd: number;
  minimum_odd_required: number;
  suggested_stake_percent: number;
  suggested_stake_amount: number;
  currency: string;
  timestamp: string;
  status: 'PENDING' | 'BET_PLACED' | 'IGNORED' | 'EXPIRED';
  reason: string;
  parent_operation_id?: string; // For Cobertura linking
}

export interface Operation {
  operation_id: string;
  user_id: string;
  signal_id: string;
  match_id: string;
  strategy: StrategyType;
  match_name: string;
  competition: string;
  favorite_team: string;
  market: string;
  stake: number;
  entry_odd: number;
  entry_minute: number;
  entry_timestamp: string;
  exit_timestamp?: string;
  status: 'ACTIVE' | 'SETTLED';
  result: 'PENDING' | 'GREEN' | 'RED';
  profit_loss: number;
  bankroll_before: number;
  bankroll_after: number;
  parent_operation_id?: string; // For Cobertura
  combined_profit_loss?: number; // Total combined sequence PnL
  score_at_entry: string;
  score_at_exit?: string;
}

export interface IgnoredSignalRecord {
  record_id: string;
  signal_id: string;
  match_id: string;
  match_name: string;
  strategy: StrategyType;
  odd: number;
  minute: number;
  timestamp: string;
  hypothetical_result?: 'GREEN' | 'RED' | 'PENDING';
  hypothetical_profit_loss?: number;
}

export interface Bankroll {
  initial: number;
  current: number;
  currency: string;
  updated_at: string;
}

export interface StakeConfig {
  ht_percent: number;
  cobertura_percent: number;
  moneyline_percent: number;
  mode: 'DYNAMIC' | 'FIXED';
  fixed_ht_amount?: number;
  fixed_cobertura_amount?: number;
  fixed_moneyline_amount?: number;
}

export interface OddsThresholdConfig {
  ht_minimum: number;
  cobertura_minimum: number;
  moneyline_minimum: number;
}

export interface MonitoringScheduleConfig {
  start_time: string; // e.g. "07:00"
  end_time: string;   // e.g. "00:00"
  interval_minutes: number; // default 5
  is_active: boolean;
}

export interface UserSettings {
  user_id: string;
  name: string;
  avatar: string;
  currency: string;
  bankroll: Bankroll;
  stakes: StakeConfig;
  odds_thresholds: OddsThresholdConfig;
  schedule: MonitoringScheduleConfig;
  notifications: {
    signals: boolean;
    goals: boolean;
    green_red: boolean;
    sound: boolean;
    telegram_alerts: boolean;
  };
  subscription: {
    status: 'ACTIVE' | 'EXPIRED' | 'TRIAL';
    tier: '3_MONTHS' | '6_MONTHS' | '9_MONTHS' | '12_MONTHS';
    expires_at: string;
    license_key?: string;
  };
  telegram_channel_url: string;
}

export interface RuleEvaluationResult {
  strategy: StrategyType;
  eligible: boolean;
  code: string;
  reason: string;
  match_id: string;
  entry_odd?: number;
  dangerous_attacks?: number;
  minute?: number;
}

export interface AnalyticsSummary {
  bankroll_initial: number;
  bankroll_current: number;
  growth_amount: number;
  growth_percent: number;
  total_staked: number;
  total_profit: number;
  total_loss: number;
  net_profit_loss: number;
  roi_percent: number;
  win_rate_percent: number;
  greens_count: number;
  reds_count: number;
  total_operations: number;
  average_stake: number;
  max_green_streak: number;
  max_red_streak: number;
  current_streak: { type: 'GREEN' | 'RED' | 'NONE'; count: number };
  max_drawdown_percent: number;
  by_strategy: {
    HT: StrategyMetrics;
    COBERTURA: StrategyMetrics;
    MONEYLINE: StrategyMetrics;
  };
}

export interface StrategyMetrics {
  operations_count: number;
  greens: number;
  reds: number;
  win_rate_percent: number;
  total_staked: number;
  net_profit_loss: number;
  roi_percent: number;
  average_odd: number;
  average_stake: number;
}

export interface CommunityPost {
  post_id: string;
  author_name: string;
  author_badge: 'VIP' | 'ANALISTA' | 'MEMBRO' | 'PROPRIETÁRIO';
  author_avatar: string;
  title: string;
  content: string;
  category: 'PRE_LIVE' | 'ANALISE' | 'AVISO' | 'FEEDBACK';
  likes: number;
  user_liked: boolean;
  created_at: string;
  comments_count: number;
  pinned?: boolean;
}

export interface CommunityComment {
  comment_id: string;
  post_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export interface LicenseKeyRecord {
  code: string;
  duration_months: 3 | 6 | 9 | 12;
  is_used: boolean;
  created_at: string;
  used_by?: string;
  used_at?: string;
}

export interface SystemBotStatus {
  online: boolean;
  monitoring_active: boolean;
  current_time: string;
  last_scan: string;
  next_scan: string;
  scan_frequency_minutes: number;
  primary_provider: DataSourceId;
  primary_status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  fallback_active: boolean;
  active_provider: DataSourceId;
  fallback_reason?: string;
  matches_analyzed_today: number;
  signals_generated_today: number;
  operations_today: number;
  mode: 'PRODUCTION' | 'DEMO';
}

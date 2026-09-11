-- ==========================================================
-- UCHIHA DA BET — DATABASE SCHEMA (PostgreSQL / Relational)
-- ==========================================================

-- 1. USERS & PROFILES
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) UNIQUE,
    avatar VARCHAR(255),
    role VARCHAR(32) DEFAULT 'USER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. USER SETTINGS & PREFERENCES
CREATE TABLE IF NOT EXISTS user_settings (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    currency VARCHAR(10) DEFAULT 'Kz',
    stake_mode VARCHAR(20) DEFAULT 'DYNAMIC',
    ht_stake_percent DECIMAL(5,2) DEFAULT 1.00,
    cobertura_stake_percent DECIMAL(5,2) DEFAULT 2.50,
    moneyline_stake_percent DECIMAL(5,2) DEFAULT 2.00,
    ht_min_odd DECIMAL(4,2) DEFAULT 1.50,
    cobertura_min_odd DECIMAL(4,2) DEFAULT 1.70,
    moneyline_min_odd DECIMAL(4,2) DEFAULT 1.70,
    notify_signals BOOLEAN DEFAULT TRUE,
    notify_goals BOOLEAN DEFAULT TRUE,
    notify_green_red BOOLEAN DEFAULT TRUE,
    notify_sound BOOLEAN DEFAULT TRUE,
    telegram_channel_url VARCHAR(255) DEFAULT 'https://t.me/uchihadabet_oficial',
    monitoring_start_time VARCHAR(10) DEFAULT '07:00',
    monitoring_end_time VARCHAR(10) DEFAULT '00:00',
    monitoring_active BOOLEAN DEFAULT TRUE
);

-- 3. BANKROLL MANAGEMENT
CREATE TABLE IF NOT EXISTS bankrolls (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    initial_amount DECIMAL(14,2) NOT NULL DEFAULT 250000.00,
    current_amount DECIMAL(14,2) NOT NULL DEFAULT 250000.00,
    currency VARCHAR(10) DEFAULT 'Kz',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. LICENSES & SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS license_keys (
    code VARCHAR(64) PRIMARY KEY,
    duration_months INT NOT NULL CHECK (duration_months IN (3, 6, 9, 12)),
    is_used BOOLEAN DEFAULT FALSE,
    used_by VARCHAR(64) REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    license_key VARCHAR(64) REFERENCES license_keys(code),
    tier VARCHAR(32) NOT NULL,
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(32) DEFAULT 'ACTIVE'
);

-- 5. MATCHES & LIVE DATA
CREATE TABLE IF NOT EXISTS matches (
    id VARCHAR(128) PRIMARY KEY,
    home_team VARCHAR(120) NOT NULL,
    away_team VARCHAR(120) NOT NULL,
    competition VARCHAR(120) NOT NULL,
    country VARCHAR(80),
    gender VARCHAR(20) DEFAULT 'male',
    minute INT DEFAULT 0,
    score_home INT DEFAULT 0,
    score_away INT DEFAULT 0,
    favorite_team VARCHAR(10) NOT NULL,
    favorite_name VARCHAR(120) NOT NULL,
    favorite_odds DECIMAL(5,2),
    first_half_odds DECIMAL(5,2),
    moneyline_odds DECIMAL(5,2),
    attacks_home INT DEFAULT 0,
    attacks_away INT DEFAULT 0,
    dangerous_attacks_home INT DEFAULT 0,
    dangerous_attacks_away INT DEFAULT 0,
    status VARCHAR(32) DEFAULT 'FIRST_HALF',
    data_source VARCHAR(64) NOT NULL,
    divergence_detected BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. MATCH SNAPSHOTS (FOR RECONSTRUCTION & HISTORICAL BACKTESTING)
CREATE TABLE IF NOT EXISTS match_snapshots (
    id SERIAL PRIMARY KEY,
    match_id VARCHAR(128) NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    minute INT NOT NULL,
    score_snapshot VARCHAR(20) NOT NULL,
    attacks_home INT NOT NULL,
    attacks_away INT NOT NULL,
    dangerous_attacks_home INT NOT NULL,
    dangerous_attacks_away INT NOT NULL,
    first_half_odd DECIMAL(5,2),
    moneyline_odd DECIMAL(5,2),
    data_source VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_snapshots_match ON match_snapshots(match_id, minute);

-- 7. SIGNALS
CREATE TABLE IF NOT EXISTS signals (
    id VARCHAR(64) PRIMARY KEY,
    match_id VARCHAR(128) NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    strategy VARCHAR(32) NOT NULL CHECK (strategy IN ('HT', 'COBERTURA', 'MONEYLINE')),
    match_name VARCHAR(255) NOT NULL,
    competition VARCHAR(120) NOT NULL,
    minute INT NOT NULL,
    favorite_team VARCHAR(120) NOT NULL,
    dangerous_attacks_favorite INT NOT NULL,
    dangerous_attacks_rate DECIMAL(4,2),
    entry_odd DECIMAL(5,2) NOT NULL,
    minimum_odd_required DECIMAL(5,2) NOT NULL,
    suggested_stake_percent DECIMAL(5,2) NOT NULL,
    suggested_stake_amount DECIMAL(14,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'Kz',
    status VARCHAR(32) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'BET_PLACED', 'IGNORED', 'EXPIRED')),
    reason TEXT,
    parent_operation_id VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_signals_created ON signals(created_at DESC);

-- 8. OPERATIONS (BETS PLACED & TRACKED)
CREATE TABLE IF NOT EXISTS operations (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    signal_id VARCHAR(64) NOT NULL REFERENCES signals(id),
    match_id VARCHAR(128) NOT NULL REFERENCES matches(id),
    strategy VARCHAR(32) NOT NULL,
    match_name VARCHAR(255) NOT NULL,
    competition VARCHAR(120) NOT NULL,
    favorite_team VARCHAR(120) NOT NULL,
    market VARCHAR(64) NOT NULL,
    stake DECIMAL(14,2) NOT NULL,
    entry_odd DECIMAL(5,2) NOT NULL,
    entry_minute INT NOT NULL,
    entry_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    exit_timestamp TIMESTAMP WITH TIME ZONE,
    status VARCHAR(32) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SETTLED')),
    result VARCHAR(32) DEFAULT 'PENDING' CHECK (result IN ('PENDING', 'GREEN', 'RED')),
    profit_loss DECIMAL(14,2) DEFAULT 0.00,
    bankroll_before DECIMAL(14,2) NOT NULL,
    bankroll_after DECIMAL(14,2) NOT NULL,
    parent_operation_id VARCHAR(64),
    score_at_entry VARCHAR(20) NOT NULL,
    score_at_exit VARCHAR(20)
);
CREATE INDEX IF NOT EXISTS idx_ops_user_status ON operations(user_id, status);

-- 9. GOALS EVENTS LOG
CREATE TABLE IF NOT EXISTS goals (
    id SERIAL PRIMARY KEY,
    match_id VARCHAR(128) NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    minute INT NOT NULL,
    scoring_team VARCHAR(120) NOT NULL,
    score_after VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. NOTIFICATIONS LOG
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id),
    type VARCHAR(32) NOT NULL CHECK (type IN ('SIGNAL_HT', 'SIGNAL_COVER', 'SIGNAL_ML', 'GOAL', 'GREEN', 'RED', 'SYSTEM_STATUS')),
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    metadata JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. DATA SOURCES & HEALTH LOGS
CREATE TABLE IF NOT EXISTS data_sources (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    priority INT NOT NULL,
    status VARCHAR(32) DEFAULT 'ONLINE',
    latency_ms INT DEFAULT 0,
    error_count INT DEFAULT 0,
    coverage_leagues INT DEFAULT 100,
    is_primary BOOLEAN DEFAULT FALSE,
    last_checked TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS data_source_logs (
    id SERIAL PRIMARY KEY,
    source_id VARCHAR(64) NOT NULL REFERENCES data_sources(id),
    status VARCHAR(32) NOT NULL,
    latency_ms INT NOT NULL,
    error_message TEXT,
    divergence_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. COMMUNITY POSTS & COMMENTS
CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    author_name VARCHAR(120) NOT NULL,
    author_badge VARCHAR(32) DEFAULT 'MEMBRO',
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(32) DEFAULT 'PRE_LIVE',
    likes INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(64) PRIMARY KEY,
    post_id VARCHAR(64) NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    author_name VARCHAR(120) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

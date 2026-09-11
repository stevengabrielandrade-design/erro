import {
  AnalyticsSummary,
  CommunityComment,
  CommunityPost,
  DataSourceConfig,
  IgnoredSignalRecord,
  LicenseKeyRecord,
  NormalizedMatch,
  Operation,
  Signal,
  SystemBotStatus,
  UserSettings,
} from '../types';

export const api = {
  async getStatus(): Promise<{ status: string; bot: SystemBotStatus; settings: UserSettings }> {
    const res = await fetch('/api/status');
    return res.json();
  },

  async getMatches(): Promise<NormalizedMatch[]> {
    const res = await fetch('/api/matches');
    return res.json();
  },

  async simulateScenario(scenario: string): Promise<{ success: boolean; match: NormalizedMatch }> {
    const res = await fetch('/api/matches/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario }),
    });
    return res.json();
  },

  async advanceSimulationStep(): Promise<any> {
    const res = await fetch('/api/monitor/advance-step', { method: 'POST' });
    return res.json();
  },

  async triggerScan(): Promise<any> {
    const res = await fetch('/api/monitor/scan', { method: 'POST' });
    return res.json();
  },

  async getSignals(): Promise<Signal[]> {
    const res = await fetch('/api/signals');
    return res.json();
  },

  async placeBet(signalId: string, customStake?: number): Promise<{ success: boolean; operation?: Operation; error?: string }> {
    const res = await fetch(`/api/signals/${signalId}/bet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ custom_stake: customStake }),
    });
    return res.json();
  },

  async ignoreSignal(signalId: string): Promise<{ success: boolean; error?: string }> {
    const res = await fetch(`/api/signals/${signalId}/ignore`, { method: 'POST' });
    return res.json();
  },

  async getIgnoredSignals(): Promise<IgnoredSignalRecord[]> {
    const res = await fetch('/api/signals/ignored');
    return res.json();
  },

  async getOperations(): Promise<Operation[]> {
    const res = await fetch('/api/operations');
    return res.json();
  },

  async getAnalytics(days?: number): Promise<AnalyticsSummary> {
    const url = days ? `/api/analytics?days=${days}` : '/api/analytics';
    const res = await fetch(url);
    return res.json();
  },

  async getSettings(): Promise<UserSettings> {
    const res = await fetch('/api/settings');
    return res.json();
  },

  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.json();
  },

  async updateBankroll(amount: number, action: 'RESET' | 'DEPOSIT'): Promise<any> {
    const res = await fetch('/api/bankroll/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, action }),
    });
    return res.json();
  },

  async getSources(): Promise<{
    primary_provider: string;
    active_provider: string;
    fallback_reason: string | null;
    sources: DataSourceConfig[];
  }> {
    const res = await fetch('/api/sources');
    return res.json();
  },

  async setPrimarySource(sourceId: string): Promise<any> {
    const res = await fetch('/api/sources/primary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source_id: sourceId }),
    });
    return res.json();
  },

  async getPosts(): Promise<CommunityPost[]> {
    const res = await fetch('/api/community/posts');
    return res.json();
  },

  async addPost(title: string, content: string, category: string): Promise<CommunityPost> {
    const res = await fetch('/api/community/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, category }),
    });
    return res.json();
  },

  async toggleLikePost(postId: string): Promise<CommunityPost> {
    const res = await fetch(`/api/community/posts/${postId}/like`, { method: 'POST' });
    return res.json();
  },

  async getComments(postId?: string): Promise<CommunityComment[]> {
    const url = postId ? `/api/community/comments?post_id=${postId}` : '/api/community/comments';
    const res = await fetch(url);
    return res.json();
  },

  async addComment(postId: string, content: string): Promise<CommunityComment> {
    const res = await fetch('/api/community/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: postId, content }),
    });
    return res.json();
  },

  async getLicenses(): Promise<LicenseKeyRecord[]> {
    const res = await fetch('/api/licenses');
    return res.json();
  },

  async generateLicense(duration: 3 | 6 | 9 | 12): Promise<LicenseKeyRecord> {
    const res = await fetch('/api/licenses/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duration }),
    });
    return res.json();
  },

  async redeemLicense(code: string): Promise<{ success: boolean; message: string; expiresAt?: string }> {
    const res = await fetch('/api/licenses/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    return res.json();
  },

  async runTests(): Promise<any> {
    const res = await fetch('/api/test-runner');
    return res.json();
  },
};

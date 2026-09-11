import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { DataStore } from './src/database/store';
import { MonitorService } from './src/services/monitor/MonitorService';
import { AnalyticsService } from './src/services/analytics/AnalyticsService';
import { runRuleEngineTests } from './src/services/rule-engine/test-runner';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const store = DataStore.getInstance();
  const monitor = MonitorService.getInstance();
  const analytics = new AnalyticsService();

  // Start background monitoring daemon
  monitor.startBackgroundMonitor();

  // ==========================================================
  // API ROUTES
  // ==========================================================

  // Health & Bot Status
  app.get('/api/status', (req, res) => {
    res.json({
      status: 'ok',
      bot: store.getStatus(),
      settings: store.getUserSettings(),
    });
  });

  // Data Sources Health Panel & Fallback Management
  app.get('/api/sources', async (req, res) => {
    const pm = monitor.getProviderManager();
    const configs = await pm.checkAllHealth();
    res.json({
      primary_provider: pm.getPrimaryProviderId(),
      active_provider: pm.getActiveProviderId(),
      fallback_reason: pm.getFallbackReason(),
      sources: configs,
    });
  });

  app.post('/api/sources/primary', (req, res) => {
    const { source_id } = req.body;
    if (source_id) {
      monitor.getProviderManager().setPrimaryProviderId(source_id);
      res.json({ success: true, primary: source_id });
    } else {
      res.status(400).json({ error: 'source_id required' });
    }
  });

  // Live Matches
  app.get('/api/matches', (req, res) => {
    const matches = store.getMatches();
    res.json(matches);
  });

  // Inject Simulation Scenarios for testing & demo
  app.post('/api/matches/simulate', (req, res) => {
    const { scenario } = req.body;
    const match = monitor.getSimulator().injectScenario(scenario || 'HT_VALID');
    // Run scan to immediately detect signal
    monitor.executeScanCycle();
    res.json({ success: true, match });
  });

  // Manual Scan Trigger & Simulation Advance
  app.post('/api/monitor/scan', async (req, res) => {
    const result = await monitor.executeScanCycle();
    res.json(result);
  });

  app.post('/api/monitor/advance-step', (req, res) => {
    const result = monitor.getSimulator().advanceSimulationStep();
    // Re-evaluate matches
    monitor.executeScanCycle();
    res.json(result);
  });

  // Signals Feed
  app.get('/api/signals', (req, res) => {
    const signals = store.getSignals();
    res.json(signals);
  });

  // Action: [APOSTAR] (Place Bet)
  app.post('/api/signals/:id/bet', (req, res) => {
    const { id } = req.params;
    const { custom_stake } = req.body;
    const result = monitor.getBankrollService().placeBet(id, custom_stake);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  // Action: [IGNORAR] (Ignore Alert)
  app.post('/api/signals/:id/ignore', (req, res) => {
    const { id } = req.params;
    const result = monitor.getBankrollService().ignoreSignal(id);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  // Ignored Signals Analysis History
  app.get('/api/signals/ignored', (req, res) => {
    res.json(store.getIgnoredSignals());
  });

  // Operations Tracking
  app.get('/api/operations', (req, res) => {
    const ops = store.getOperations();
    res.json(ops);
  });

  // Analytics & Strategy Breakdowns
  app.get('/api/analytics', (req, res) => {
    const days = req.query.days ? Number(req.query.days) : undefined;
    const summary = analytics.getSummary(days);
    res.json(summary);
  });

  // User Settings & Profile
  app.get('/api/settings', (req, res) => {
    res.json(store.getUserSettings());
  });

  app.post('/api/settings', (req, res) => {
    const updated = store.updateUserSettings(req.body);
    monitor.getRuleEngine().updateThresholds(updated.odds_thresholds);
    res.json(updated);
  });

  // Reset or Deposit Bankroll
  app.post('/api/bankroll/update', (req, res) => {
    const { amount, action } = req.body;
    const current = store.getUserSettings().bankroll;
    let newAmount = current.current;
    if (action === 'RESET') {
      newAmount = Number(amount) || 250000;
    } else if (action === 'DEPOSIT') {
      newAmount += Number(amount) || 0;
    }
    const updated = store.updateUserSettings({
      bankroll: {
        ...current,
        initial: action === 'RESET' ? newAmount : current.initial,
        current: newAmount,
        updated_at: new Date().toISOString(),
      }
    });
    res.json(updated.bankroll);
  });

  // Community Feed
  app.get('/api/community/posts', (req, res) => {
    res.json(store.getPosts());
  });

  app.post('/api/community/posts', (req, res) => {
    const { title, content, category } = req.body;
    const user = store.getUserSettings();
    const newPost = {
      post_id: `post_${Date.now()}`,
      author_name: user.name || 'Membro Uchiha',
      author_badge: 'MEMBRO' as const,
      author_avatar: user.avatar,
      title: title || 'Nova Análise',
      content: content || '',
      category: category || 'ANALISE',
      likes: 0,
      user_liked: false,
      created_at: new Date().toISOString(),
      comments_count: 0,
    };
    store.addPost(newPost);
    res.json(newPost);
  });

  app.post('/api/community/posts/:id/like', (req, res) => {
    const updated = store.toggleLikePost(req.params.id);
    if (!updated) return res.status(404).json({ error: 'Post not found' });
    res.json(updated);
  });

  app.get('/api/community/comments', (req, res) => {
    const postId = req.query.post_id as string | undefined;
    res.json(store.getComments(postId));
  });

  app.post('/api/community/comments', (req, res) => {
    const { post_id, content } = req.body;
    const user = store.getUserSettings();
    const newComment = {
      comment_id: `comm_${Date.now()}`,
      post_id,
      author_name: user.name,
      content,
      created_at: new Date().toISOString(),
    };
    store.addComment(newComment);
    res.json(newComment);
  });

  // Licensing & Subscription Codes
  app.get('/api/licenses', (req, res) => {
    res.json(store.getLicenses());
  });

  app.post('/api/licenses/generate', (req, res) => {
    const { duration } = req.body;
    const validDurations = [3, 6, 9, 12];
    const dur = validDurations.includes(Number(duration)) ? Number(duration) as 3 | 6 | 9 | 12 : 3;
    const license = store.createLicense(dur);
    res.json(license);
  });

  app.post('/api/licenses/redeem', (req, res) => {
    const { code } = req.body;
    const user = store.getUserSettings();
    const result = store.redeemLicense(code, user.user_id);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  // Automated Unit Test Runner API (Rule Engine verification)
  app.get('/api/test-runner', (req, res) => {
    const summary = runRuleEngineTests();
    res.json(summary);
  });

  // Static public assets (Service Worker, manifest, icons)
  app.use(express.static(path.join(process.cwd(), 'public')));

  // ==========================================================
  // VITE MIDDLEWARE / SPA SERVING
  // ==========================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`👁️🔥 UCHIHA DA BET — BACKEND RUNNING ON PORT ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🟢 Monitor Daemon: ATIVO (07:00 às 00:00)`);
    console.log(`====================================================`);
  });
}

startServer();

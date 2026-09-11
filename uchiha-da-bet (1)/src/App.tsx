import React, { useState, useEffect, useRef } from 'react';
import { api } from './services/api';
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
} from './types';
import { Header } from './components/Header';
import { BottomNav, TabId } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { SignalsView } from './components/SignalsView';
import { AnalyticsView } from './components/AnalyticsView';
import { CommunityView } from './components/CommunityView';
import { SettingsAdminView } from './components/SettingsAdminView';
import { ShopView } from './components/ShopView';
import { BetActionModal } from './components/BetActionModal';
import { TestRunnerModal } from './components/TestRunnerModal';
import { NotificationTestModal } from './components/NotificationTestModal';
import { MobileNotificationBanner, MobileBannerData } from './components/MobileNotificationBanner';
import { notificationService } from './services/notificationService';
import { soundManager } from './utils/audio';
import confetti from 'canvas-confetti';

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [status, setStatus] = useState<SystemBotStatus | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [matches, setMatches] = useState<NormalizedMatch[]>([]);
  const [sources, setSources] = useState<DataSourceConfig[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [licenses, setLicenses] = useState<LicenseKeyRecord[]>([]);
  const [ignoredSignals, setIgnoredSignals] = useState<IgnoredSignalRecord[]>([]);

  const [selectedSignalForBet, setSelectedSignalForBet] = useState<Signal | null>(null);
  const [isTestRunnerOpen, setIsTestRunnerOpen] = useState(false);
  const [isNotificationTestOpen, setIsNotificationTestOpen] = useState(false);
  const [mobileBanner, setMobileBanner] = useState<MobileBannerData | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  const prevSignalsCountRef = useRef<number>(0);

  // Initial load & Polling loop
  const fetchAllData = async () => {
    try {
      const [statusRes, matchesRes, signalsRes, opsRes, analyticsRes, sourcesRes, postsRes, commentsRes, licensesRes, ignoredRes] =
        await Promise.all([
          api.getStatus(),
          api.getMatches(),
          api.getSignals(),
          api.getOperations(),
          api.getAnalytics(),
          api.getSources(),
          api.getPosts(),
          api.getComments(),
          api.getLicenses(),
          api.getIgnoredSignals(),
        ]);

      setStatus(statusRes.bot);
      setSettings(statusRes.settings);
      setMatches(matchesRes);
      setSignals(signalsRes);
      setOperations(opsRes);
      setAnalytics(analyticsRes);
      setSources(sourcesRes.sources);
      setPosts(postsRes);
      setComments(commentsRes);
      setLicenses(licensesRes);
      setIgnoredSignals(ignoredRes);

      // Sound & Mobile Notification for new signals
      const pendingList = signalsRes.filter((s) => s.status === 'PENDING');
      const pendingCount = pendingList.length;
      if (pendingCount > prevSignalsCountRef.current && prevSignalsCountRef.current > 0) {
        const latest = pendingList[0];
        if (latest) {
          notificationService.sendMobileNotification({
            title: `🔥 Uchiha da Bet — SINAL ${latest.strategy}!`,
            body: `⚡ ${latest.match_name} (${latest.minute}') — Odd @${latest.odd.toFixed(2)} (${latest.dangerous_attacks_favorite} AP)`,
            tag: latest.signal_id,
            soundType: 'signal',
          });

          setMobileBanner({
            id: latest.signal_id,
            title: `🔥 SINAL ${latest.strategy}: ${latest.match_name}`,
            body: `Minuto ${latest.minute}' • Odd @${latest.odd.toFixed(2)} • ${latest.dangerous_attacks_favorite} Ataques Perigosos`,
            onAction: () => {
              setSelectedSignalForBet(latest);
            },
          });
        } else if (soundEnabled) {
          soundManager.playSignalAlert();
        }
      }
      prevSignalsCountRef.current = pendingCount;
    } catch (err) {
      console.error('Failed to sync state:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 4000);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  // Handler: Bet Placement
  const handlePlaceBet = async (signalId: string, customStake?: number) => {
    try {
      const res = await api.placeBet(signalId, customStake);
      if (res.success) {
        if (soundEnabled) soundManager.playGreenWin();
        setSelectedSignalForBet(null);
        await fetchAllData();
      } else {
        alert(res.error || 'Não foi possível colocar a aposta.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Ignore Signal
  const handleIgnore = async (signalId: string) => {
    try {
      const res = await api.ignoreSignal(signalId);
      if (res.success) {
        setSelectedSignalForBet(null);
        await fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Trigger Manual Scan
  const handleTriggerScan = async () => {
    setIsScanning(true);
    try {
      await api.triggerScan();
      await fetchAllData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  // Handler: Inject Demo Scenario
  const handleInjectDemo = async (scenario: string) => {
    try {
      await api.simulateScenario(scenario);
      if (soundEnabled) soundManager.playSignalAlert();
      await fetchAllData();
      setActiveTab('signals');
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Advance simulation step
  const handleAdvanceStep = async () => {
    try {
      const res = await api.advanceSimulationStep();
      if (res.newGoals && res.newGoals.length > 0) {
        if (soundEnabled) soundManager.playGoalAlert();
      }
      if (res.settledOps && res.settledOps.length > 0) {
        const hasGreen = res.settledOps.some((o: any) => o.result === 'GREEN');
        if (hasGreen) {
          if (soundEnabled) soundManager.playGreenWin();
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
        }
      }
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Update Settings
  const handleUpdateSettings = async (newSettings: Partial<UserSettings>) => {
    try {
      const updated = await api.updateSettings(newSettings);
      setSettings(updated);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Bankroll Update
  const handleUpdateBankroll = async (amount: number, action: 'RESET' | 'DEPOSIT') => {
    try {
      await api.updateBankroll(amount, action);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Set Primary Data Source
  const handleSetPrimarySource = async (sourceId: string) => {
    try {
      await api.setPrimarySource(sourceId);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Redeem License
  const handleRedeemLicense = async (code: string) => {
    try {
      const res = await api.redeemLicense(code);
      if (res.success) {
        alert(res.message);
        await fetchAllData();
      } else {
        alert(res.message || 'Código inválido');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Generate License
  const handleGenerateLicense = async (duration: 3 | 6 | 9 | 12) => {
    try {
      await api.generateLicense(duration);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Like Community Post
  const handleLikePost = async (postId: string) => {
    try {
      await api.toggleLikePost(postId);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Add Community Post
  const handleAddPost = async (title: string, content: string, category: string) => {
    try {
      await api.addPost(title, content, category);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Add Comment
  const handleAddComment = async (postId: string, content: string) => {
    try {
      await api.addComment(postId, content);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const pendingSignalsCount = signals.filter((s) => s.status === 'PENDING').length;
  const activeOpsCount = operations.filter((o) => o.status === 'ACTIVE').length;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Sticky Header */}
      <Header
        status={status}
        settings={settings}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onTriggerScan={handleTriggerScan}
        isScanning={isScanning}
        onOpenNotificationTest={() => setIsNotificationTestOpen(true)}
      />

      {/* Floating Mobile Notification Banner */}
      <MobileNotificationBanner
        banner={mobileBanner}
        onDismiss={() => setMobileBanner(null)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-4">
        {activeTab === 'dashboard' && (
          <DashboardView
            status={status}
            settings={settings}
            analytics={analytics}
            signals={signals}
            operations={operations}
            matches={matches}
            onSelectSignal={(sig) => setSelectedSignalForBet(sig)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onInjectDemo={handleInjectDemo}
            onAdvanceStep={handleAdvanceStep}
            onOpenNotificationTest={() => setIsNotificationTestOpen(true)}
          />
        )}

        {activeTab === 'signals' && (
          <SignalsView
            signals={signals}
            matches={matches}
            settings={settings}
            onSelectSignal={(sig) => setSelectedSignalForBet(sig)}
            onPlaceBet={handlePlaceBet}
            onIgnore={handleIgnore}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            analytics={analytics}
            operations={operations}
            ignoredSignals={ignoredSignals}
            settings={settings}
          />
        )}

        {activeTab === 'community' && (
          <CommunityView
            posts={posts}
            comments={comments}
            settings={settings}
            onLikePost={handleLikePost}
            onAddPost={handleAddPost}
            onAddComment={handleAddComment}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsAdminView
            settings={settings}
            sources={sources}
            licenses={licenses}
            onUpdateSettings={handleUpdateSettings}
            onUpdateBankroll={handleUpdateBankroll}
            onSetPrimarySource={handleSetPrimarySource}
            onRedeemLicense={handleRedeemLicense}
            onGenerateLicense={handleGenerateLicense}
            onOpenTestRunner={() => setIsTestRunnerOpen(true)}
            onOpenNotificationTest={() => setIsNotificationTestOpen(true)}
          />
        )}

        {activeTab === 'shop' && (
          <ShopView
            whatsappNumber={settings?.whatsapp_support}
            currency={settings?.currency}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        pendingSignalsCount={pendingSignalsCount}
        activeOpsCount={activeOpsCount}
      />

      {/* Bet Decision Modal */}
      {selectedSignalForBet && (
        <BetActionModal
          signal={selectedSignalForBet}
          settings={settings}
          onClose={() => setSelectedSignalForBet(null)}
          onPlaceBet={handlePlaceBet}
          onIgnore={handleIgnore}
        />
      )}

      {/* Rule Engine Test Runner Modal */}
      {isTestRunnerOpen && (
        <TestRunnerModal onClose={() => setIsTestRunnerOpen(false)} />
      )}

      {/* Mobile Notification Bar Test Modal */}
      {isNotificationTestOpen && (
        <NotificationTestModal onClose={() => setIsNotificationTestOpen(false)} />
      )}
    </div>
  );
}
export default App;

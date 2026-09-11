import React, { useState } from 'react';
import { DataSourceConfig, LicenseKeyRecord, UserSettings } from '../types';
import {
  Settings,
  ShieldCheck,
  Key,
  Radio,
  Clock,
  Coins,
  Percent,
  TrendingUp,
  Server,
  Play,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  BellRing,
  Smartphone,
} from 'lucide-react';

interface SettingsAdminViewProps {
  settings: UserSettings | null;
  sources: DataSourceConfig[];
  licenses: LicenseKeyRecord[];
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  onUpdateBankroll: (amount: number, action: 'RESET' | 'DEPOSIT') => void;
  onSetPrimarySource: (sourceId: string) => void;
  onRedeemLicense: (code: string) => void;
  onGenerateLicense: (duration: 3 | 6 | 9 | 12) => void;
  onOpenTestRunner: () => void;
  onOpenNotificationTest?: () => void;
}

export const SettingsAdminView: React.FC<SettingsAdminViewProps> = ({
  settings,
  sources,
  licenses,
  onUpdateSettings,
  onUpdateBankroll,
  onSetPrimarySource,
  onRedeemLicense,
  onGenerateLicense,
  onOpenTestRunner,
  onOpenNotificationTest,
}) => {
  if (!settings) return null;

  const [name, setName] = useState(settings.name);
  const [currency, setCurrency] = useState(settings.currency);
  const [stakeMode, setStakeMode] = useState(settings.stakes.mode);
  const [htPercent, setHtPercent] = useState(settings.stakes.ht_percent);
  const [cobPercent, setCobPercent] = useState(settings.stakes.cobertura_percent);
  const [mlPercent, setMlPercent] = useState(settings.stakes.moneyline_percent);

  const [htMinOdd, setHtMinOdd] = useState(settings.odds_thresholds.ht_minimum);
  const [cobMinOdd, setCobMinOdd] = useState(settings.odds_thresholds.cobertura_minimum);
  const [mlMinOdd, setMlMinOdd] = useState(settings.odds_thresholds.moneyline_minimum);

  const [startTime, setStartTime] = useState(settings.schedule.start_time);
  const [endTime, setEndTime] = useState(settings.schedule.end_time);

  const [redeemCode, setRedeemCode] = useState('');
  const [licenseDuration, setLicenseDuration] = useState<3 | 6 | 9 | 12>(12);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Bankroll adjustment state
  const [depositAmount, setDepositAmount] = useState<number>(50000);
  const [resetAmount, setResetAmount] = useState<number>(250000);

  const handleSaveProfileAndStakes = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      name,
      currency,
      stakes: {
        ...settings.stakes,
        mode: stakeMode,
        ht_percent: Number(htPercent),
        cobertura_percent: Number(cobPercent),
        moneyline_percent: Number(mlPercent),
      },
      odds_thresholds: {
        ht_minimum: Number(htMinOdd),
        cobertura_minimum: Number(cobMinOdd),
        moneyline_minimum: Number(mlMinOdd),
      },
      schedule: {
        ...settings.schedule,
        start_time: startTime,
        end_time: endTime,
      },
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const copyLicense = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-300">
      {/* Save Notification */}
      {savedSuccess && (
        <div className="bg-emerald-950/80 border border-emerald-700/60 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-300 font-semibold shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          Configurações salvas e aplicadas com sucesso no Motor de Regras e Monitor!
        </div>
      )}

      {/* Profile & Stakes Configuration */}
      <form onSubmit={handleSaveProfileAndStakes} className="bg-[#121216] border border-zinc-800 rounded-2xl p-5 space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-500" />
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
              Configurações de Perfil & Estratégia
            </h3>
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            Salvar e Ativar Bot
          </button>
        </div>

        {/* Name & Currency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-zinc-400 font-semibold block mb-1">Nome do Operador</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 font-semibold block mb-1">Moeda da Banca</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="Kz">Kz (Kwanza Angolano)</option>
              <option value="BRL">R$ (Real Brasileiro)</option>
              <option value="EUR">€ (Euro)</option>
              <option value="USD">$ (Dólar)</option>
            </select>
          </div>
        </div>

        {/* Stakes Management */}
        <div className="pt-2 border-t border-zinc-900 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200 uppercase tracking-wide flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-orange-400" />
              Gestão de Stakes por Estratégia
            </span>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setStakeMode('DYNAMIC')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                  stakeMode === 'DYNAMIC' ? 'bg-orange-600 text-white' : 'bg-zinc-900 text-zinc-400'
                }`}
              >
                Stake Dinâmica (% da Banca)
              </button>
              <button
                type="button"
                onClick={() => setStakeMode('FIXED')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                  stakeMode === 'FIXED' ? 'bg-orange-600 text-white' : 'bg-zinc-900 text-zinc-400'
                }`}
              >
                Stake Fixa
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
              <label className="text-[11px] text-zinc-400 block mb-1 font-semibold">Stake HT (%)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={htPercent}
                  onChange={(e) => setHtPercent(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                />
                <span className="text-xs font-bold text-orange-400">%</span>
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 block">Padrão recomendado: 1.0%</span>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
              <label className="text-[11px] text-zinc-400 block mb-1 font-semibold">Stake Cobertura (%)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={cobPercent}
                  onChange={(e) => setCobPercent(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                />
                <span className="text-xs font-bold text-orange-400">%</span>
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 block">Padrão recomendado: 2.5%</span>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
              <label className="text-[11px] text-zinc-400 block mb-1 font-semibold">Stake Moneyline (%)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={mlPercent}
                  onChange={(e) => setMlPercent(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                />
                <span className="text-xs font-bold text-orange-400">%</span>
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 block">Padrão recomendado: 2.0%</span>
            </div>
          </div>
        </div>

        {/* Odds Mínimas (Pisos Mínimos) */}
        <div className="pt-2 border-t border-zinc-900 space-y-3">
          <span className="text-xs font-bold text-zinc-200 uppercase tracking-wide flex items-center gap-1.5">
            <Percent className="w-4 h-4 text-orange-400" />
            Odds Mínimas Configuradas (Pisos)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
              <label className="text-[11px] text-zinc-400 block mb-1 font-semibold">Odd Mínima HT</label>
              <input
                type="number"
                step="0.01"
                value={htMinOdd}
                onChange={(e) => setHtMinOdd(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">Padrão: 1.50 (1.49 rejeita)</span>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
              <label className="text-[11px] text-zinc-400 block mb-1 font-semibold">Odd Mínima Cobertura</label>
              <input
                type="number"
                step="0.01"
                value={cobMinOdd}
                onChange={(e) => setCobMinOdd(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">Padrão: 1.70 (1.69 rejeita)</span>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
              <label className="text-[11px] text-zinc-400 block mb-1 font-semibold">Odd Mínima Moneyline</label>
              <input
                type="number"
                step="0.01"
                value={mlMinOdd}
                onChange={(e) => setMlMinOdd(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">Padrão: 1.70 (1.69 rejeita)</span>
            </div>
          </div>
        </div>

        {/* Monitoring Hours */}
        <div className="pt-2 border-t border-zinc-900 space-y-3">
          <span className="text-xs font-bold text-zinc-200 uppercase tracking-wide flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-orange-400" />
            Janela Horária de Monitoramento Automático
          </span>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1 font-semibold">Início do Monitoramento</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">Padrão: 07:00</span>
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1 font-semibold">Pausa do Monitoramento</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">Padrão: 00:00 (Pausa madrugada)</span>
            </div>
          </div>
        </div>
      </form>

      {/* Direct Bankroll Adjustment Tools */}
      <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
          Operações de Depósito & Redefinição de Banca
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex items-end gap-2">
            <div className="flex-1">
              <label className="text-xs text-zinc-400 font-semibold block mb-1">Adicionar Depósito à Banca</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
              />
            </div>
            <button
              onClick={() => onUpdateBankroll(depositAmount, 'DEPOSIT')}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
            >
              Depositar
            </button>
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex items-end gap-2">
            <div className="flex-1">
              <label className="text-xs text-zinc-400 font-semibold block mb-1">Redefinir Banca Inicial</label>
              <input
                type="number"
                value={resetAmount}
                onChange={(e) => setResetAmount(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
              />
            </div>
            <button
              onClick={() => onUpdateBankroll(resetAmount, 'RESET')}
              className="px-4 py-2 rounded-lg bg-red-800 hover:bg-red-700 text-white font-bold text-xs"
            >
              Resetar
            </button>
          </div>
        </div>
      </div>

      {/* Data Sources Health Dashboard & Fallback Management (Requirements 5, 6, 38, 39) */}
      <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-orange-500" />
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
              Saúde das Fontes de Dados & Fallback
            </h3>
          </div>
          <span className="text-xs text-zinc-400">
            Prioridade Inicial: <strong className="text-white">ScoreBing (1º)</strong>
          </span>
        </div>

        <div className="space-y-2.5">
          {sources.map((src) => {
            const isPrimary = src.isPrimary;
            const isOnline = src.status === 'ONLINE';

            return (
              <div
                key={src.id}
                className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/90 flex flex-wrap items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-xs font-extrabold text-white">{src.name}</strong>
                      {isPrimary && (
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-orange-950 text-orange-400 border border-orange-800">
                          FONTE PRINCIPAL
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Prioridade #{src.priority} • Latência: {src.latencyMs}ms • Cobertura: {src.coverageLeagues}+ ligas
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      isOnline ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                    }`}
                  >
                    {src.status}
                  </span>

                  {!isPrimary && (
                    <button
                      onClick={() => onSetPrimarySource(src.id)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-[11px] font-semibold transition-colors"
                    >
                      Definir como Principal
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Licensing & Access Voucher Management (Requirements 47 & 48) */}
      <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-orange-500" />
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
              Assinatura & Licenciamento por Código
            </h3>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-orange-950 text-orange-400 border border-orange-800">
            Plano: {settings.subscription.tier} (Ativo até {new Date(settings.subscription.expires_at).toLocaleDateString('pt-PT')})
          </span>
        </div>

        {/* Redeem Form */}
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 space-y-3">
          <label className="text-xs text-zinc-300 font-semibold block">
            Possui um código de ativação? Insira abaixo para desbloquear seu período de acesso:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ex: UCHIHA-12M-XXXX"
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 uppercase"
            />
            <button
              type="button"
              onClick={() => onRedeemLicense(redeemCode)}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-colors"
            >
              Ativar Código
            </button>
          </div>
        </div>

        {/* Administrator Code Generator */}
        <div className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800/60 space-y-3">
          <div className="flex items-center justify-between">
            <strong className="text-xs text-zinc-300 font-semibold">
              Painel do Administrador: Gerador de Licenças
            </strong>
            <div className="flex items-center gap-2">
              <select
                value={licenseDuration}
                onChange={(e) => setLicenseDuration(Number(e.target.value) as any)}
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-200"
              >
                <option value={3}>3 Meses</option>
                <option value={6}>6 Meses</option>
                <option value={9}>9 Meses</option>
                <option value={12}>12 Meses</option>
              </select>
              <button
                type="button"
                onClick={() => onGenerateLicense(licenseDuration)}
                className="px-3 py-1 rounded-lg bg-red-900 hover:bg-red-800 text-white font-bold text-xs"
              >
                Gerar Código
              </button>
            </div>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pt-1">
            {licenses.map((lic) => (
              <div
                key={lic.code}
                className="bg-zinc-900/90 px-3 py-2 rounded-lg flex items-center justify-between text-xs font-mono"
              >
                <span className="text-zinc-200 font-bold">{lic.code}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400">{lic.duration_months} Meses</span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      lic.is_used ? 'bg-zinc-800 text-zinc-500' : 'bg-emerald-950 text-emerald-400'
                    }`}
                  >
                    {lic.is_used ? 'UTILIZADO' : 'DISPONÍVEL'}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyLicense(lic.code)}
                    className="p-1 text-zinc-400 hover:text-white"
                  >
                    {copiedCode === lic.code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Notification Bar Test Card */}
      {onOpenNotificationTest && (
        <div className="bg-gradient-to-r from-orange-950/40 via-zinc-900 to-zinc-900 border border-orange-500/40 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-orange-400" />
              <h3 className="text-sm font-extrabold text-white">
                Teste de Notificações na Barra do Celular (Push Mobile)
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
              Verifique permissões do navegador móvel, acione disparos imediatos ou configure contagem regressiva de 5 segundos para testar com a tela bloqueada ou aplicativo em segundo plano.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenNotificationTest}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-extrabold text-xs shadow-lg flex items-center gap-2 active:scale-95 transition-all shrink-0 self-start sm:self-auto"
          >
            <BellRing className="w-4 h-4" />
            <span>SIMULAR NO CELULAR</span>
          </button>
        </div>
      )}

      {/* Official Rule Engine Verification Test Runner (Requirement 52) */}
      <div className="bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-900 border border-red-900/40 rounded-2xl p-5 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-extrabold text-white">Bateria Oficial de Testes do Rule Engine</h3>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
            Execute os 13 testes unitários que validam matematicamente as regras de HT (1.49 vs 1.50 odd, 14 vs 15 ataques), Cobertura (1.69 vs 1.70 odd, 50 ataques acumulados), Moneyline (corte aos 70 minutos) e cálculos de GREEN/RED.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenTestRunner}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-extrabold text-xs shadow-lg flex items-center gap-2 active:scale-95 transition-all shrink-0"
        >
          <Play className="w-4 h-4" />
          <span>RODAR TESTES DO MOTOR</span>
        </button>
      </div>
    </div>
  );
};

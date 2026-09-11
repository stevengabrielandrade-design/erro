import React, { useState } from 'react';
import { api } from '../services/api';
import { X, CheckCircle, AlertTriangle, Play, ShieldCheck, RefreshCw } from 'lucide-react';

interface TestRunnerModalProps {
  onClose: () => void;
}

export const TestRunnerModal: React.FC<TestRunnerModalProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  const runTests = async () => {
    setLoading(true);
    try {
      const data = await api.runTests();
      setSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#121216] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-zinc-800 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">
                Bateria de Testes do Motor de Regras (Rule Engine)
              </h3>
              <p className="text-xs text-zinc-400">
                Verificação automatizada de HT, Cobertura, Moneyline e cálculo de Banca (Requisito 52)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {summary && (
            <div className="flex items-center justify-between bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 mb-2">
              <div className="text-xs">
                <span className="text-zinc-400">Total de Casos: </span>
                <strong className="text-white font-mono">{summary.total}</strong>
                <span className="mx-2 text-zinc-600">|</span>
                <span className="text-emerald-400 font-bold">Passou: {summary.passed}</span>
                <span className="mx-2 text-zinc-600">|</span>
                <span className="text-red-400 font-bold">Falhou: {summary.failed}</span>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-600/40 text-emerald-400 text-xs font-bold font-mono">
                {summary.allPassed ? '100% APROVADO 🟢' : 'FALHA DETECTADA 🔴'}
              </div>
            </div>
          )}

          {loading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-zinc-400">
              <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
              <span className="text-sm">Executando suite de testes do Rule Engine...</span>
            </div>
          )}

          {summary?.results?.map((res: any, idx: number) => (
            <div
              key={res.id || idx}
              className={`p-3 rounded-xl border text-xs leading-relaxed transition-all ${
                res.passed
                  ? 'bg-zinc-950/80 border-emerald-900/40 hover:border-emerald-800/60'
                  : 'bg-red-950/20 border-red-900/60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  {res.passed ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-semibold text-zinc-200">{res.name}</span>
                    <div className="text-[11px] text-zinc-400 mt-1 font-mono">{res.details}</div>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded shrink-0 ${
                    res.passed ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'
                  }`}
                >
                  {res.passed ? 'PASSOU' : 'FALHOU'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-zinc-500">
            Executado em conformidade com as regras estritas de odds mínimas e janelas temporais.
          </span>
          <button
            onClick={runTests}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow transition-colors disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            Re-executar Testes
          </button>
        </div>
      </div>
    </div>
  );
};

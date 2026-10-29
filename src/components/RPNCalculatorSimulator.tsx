import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  RotateCcw,
  ArrowUpDown,
  Trash2,
  Volume2,
  VolumeX,
  Play,
  Sparkles,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  History,
  Info,
  Percent
} from 'lucide-react';
import { playKeyClick, toggleAudioMute, getIsAudioMuted } from '../utils/audio';

interface LogItem {
  id: string;
  action: string;
  detail: string;
  timestamp: string;
}

export const RPNCalculatorSimulator: React.FC = () => {
  // Pilha de 5 níveis: index 0 é Nível 1 (X), index 4 é Nível 5 (U)
  const [levels, setLevels] = useState<number[]>([0, 0, 0, 0, 0]);
  const [currentEntry, setCurrentEntry] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Pronto • Digite números e pressione ENTER');
  const [statusType, setStatusType] = useState<'info' | 'success' | 'error'>('info');
  const [isMuted, setIsMuted] = useState<boolean>(getIsAudioMuted());
  const [history, setHistory] = useState<LogItem[]>([]);
  const [highlightLevel, setHighlightLevel] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const addLog = (action: string, detail: string) => {
    const time = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    setHistory((prev) => [
      { id: Math.random().toString(36).substring(2, 9), action, detail, timestamp: time },
      ...prev.slice(0, 19),
    ]);
  };

  const formatNumber = (num: number): string => {
    if (Number.isInteger(num)) return num.toString();
    // Limita dízimas periódicas a 6 casas decimais legíveis
    return parseFloat(num.toFixed(6)).toString();
  };

  // Atualiza Nível 1 durante digitação
  const handleDigit = useCallback((digit: string) => {
    playKeyClick('num');
    setIsTyping(true);
    setCurrentEntry((prev) => {
      const next = prev === '0' || prev === '' ? digit : prev + digit;
      const parsed = parseFloat(next);
      setLevels((lvl) => [isNaN(parsed) ? 0 : parsed, lvl[1], lvl[2], lvl[3], lvl[4]]);
      return next;
    });
    setStatusMessage(`Digitando ${digit} no Nível 1 (X)`);
    setStatusType('info');
  }, []);

  const handleDot = useCallback(() => {
    playKeyClick('num');
    setIsTyping(true);
    setCurrentEntry((prev) => {
      if (prev.includes('.')) return prev;
      const next = prev === '' ? '0.' : prev + '.';
      const parsed = parseFloat(next);
      setLevels((lvl) => [isNaN(parsed) ? 0 : parsed, lvl[1], lvl[2], lvl[3], lvl[4]]);
      return next;
    });
  }, []);

  const handleToggleSign = useCallback(() => {
    playKeyClick('num');
    setCurrentEntry((prev) => {
      let next = prev;
      if (prev) {
        next = prev.startsWith('-') ? prev.slice(1) : '-' + prev;
      }
      setLevels((lvl) => [-lvl[0], lvl[1], lvl[2], lvl[3], lvl[4]]);
      return next;
    });
  }, []);

  const handleBackspace = useCallback(() => {
    playKeyClick('num');
    if (isTyping && currentEntry.length > 0) {
      const next = currentEntry.slice(0, -1);
      setCurrentEntry(next);
      const parsed = parseFloat(next);
      setLevels((lvl) => [isNaN(parsed) || next === '' || next === '-' ? 0 : parsed, lvl[1], lvl[2], lvl[3], lvl[4]]);
    }
  }, [currentEntry, isTyping]);

  const handleEnter = useCallback(() => {
    playKeyClick('enter');
    setHighlightLevel(1);
    setTimeout(() => setHighlightLevel(null), 300);

    setLevels((lvl) => {
      const val = lvl[0];
      // Duplica L1 para L2, e tudo sobe: L1->L2, L2->L3, L3->L4, L4->L5 (L5 anterior descartado)
      const newLevels = [val, lvl[0], lvl[1], lvl[2], lvl[3]];
      addLog('ENTER ↵', `Valor ${formatNumber(val)} empurrado para Nível 2. Pilha deslocada.`);
      return newLevels;
    });

    setIsTyping(false);
    setCurrentEntry('');
    setStatusMessage('ENTER: Valor confirmado e empilhado.');
    setStatusType('success');
  }, []);

  const handleOperation = useCallback((op: '+' | '-' | '*' | '/') => {
    setIsTyping(false);
    setCurrentEntry('');

    setLevels((lvl) => {
      const valX = lvl[0]; // Nível 1
      const valY = lvl[1]; // Nível 2
      let result = 0;

      if (op === '+') {
        result = valY + valX;
      } else if (op === '-') {
        result = valY - valX;
      } else if (op === '*') {
        result = valY * valX;
      } else if (op === '/') {
        if (valX === 0) {
          playKeyClick('error');
          setStatusMessage('Erro matemático: Divisão por zero!');
          setStatusType('error');
          addLog('ERRO ÷', 'Tentativa de divisão por zero evitada.');
          return lvl;
        }
        result = valY / valX;
      }

      playKeyClick('op');
      const opSymbols: Record<string, string> = { '+': '+', '-': '−', '*': '×', '/': '÷' };
      const opName: Record<string, string> = { '+': 'Soma', '-': 'Subtração', '*': 'Multiplicação', '/': 'Divisão' };

      addLog(`${opSymbols[op]}`, `${formatNumber(valY)} ${opSymbols[op]} ${formatNumber(valX)} = ${formatNumber(result)}`);
      setStatusMessage(`${opName[op]}: ${formatNumber(valY)} ${opSymbols[op]} ${formatNumber(valX)} = ${formatNumber(result)}`);
      setStatusType('success');

      // Pilha desce: L1 recebe resultado, L3 vira L2, L4 vira L3, L5 vira L4, L5 novo é 0.0
      return [result, lvl[2], lvl[3], lvl[4], 0];
    });
  }, []);

  const handlePercent = useCallback(() => {
    setIsTyping(false);
    setCurrentEntry('');

    setLevels((lvl) => {
      const valX = lvl[0]; // Nível 1 (taxa percentual)
      const valY = lvl[1]; // Nível 2 (base)
      let result = 0;

      if (valY !== 0) {
        // Ex: 200 ENTER 15 % -> 30, com base 200 preservada em L2
        result = (valY * valX) / 100.0;
        playKeyClick('op');
        addLog('%', `${formatNumber(valX)}% de ${formatNumber(valY)} = ${formatNumber(result)} (Base mantida em L2)`);
        setStatusMessage(`Porcentagem: ${formatNumber(valX)}% de ${formatNumber(valY)} = ${formatNumber(result)} (Pressione + ou −)`);
        setStatusType('success');
        // Mantém Nível 2 intacto para somar ou subtrair imediatamente (+ / -)
        return [result, lvl[1], lvl[2], lvl[3], lvl[4]];
      } else {
        // Caso unário: X / 100
        result = valX / 100.0;
        playKeyClick('op');
        addLog('%', `${formatNumber(valX)} / 100 = ${formatNumber(result)}`);
        setStatusMessage(`Porcentagem: ${formatNumber(valX)}% = ${formatNumber(result)}`);
        setStatusType('success');
        return [result, lvl[1], lvl[2], lvl[3], lvl[4]];
      }
    });
  }, []);

  const handleSwap = useCallback(() => {
    playKeyClick('num');
    setIsTyping(false);
    setCurrentEntry('');
    setLevels((lvl) => {
      const newLvl = [lvl[1], lvl[0], lvl[2], lvl[3], lvl[4]];
      addLog('SWAP X⇄Y', `Trocados Nível 1 (${formatNumber(lvl[0])}) e Nível 2 (${formatNumber(lvl[1])})`);
      return newLvl;
    });
    setStatusMessage('SWAP: Nível 1 e Nível 2 invertidos.');
    setStatusType('info');
  }, []);

  const handleDrop = useCallback(() => {
    playKeyClick('clear');
    setIsTyping(false);
    setCurrentEntry('');
    setLevels((lvl) => {
      const dropped = lvl[0];
      const newLvl = [lvl[1], lvl[2], lvl[3], lvl[4], 0];
      addLog('DROP', `Descartado ${formatNumber(dropped)} do Nível 1. Pilha desceu.`);
      return newLvl;
    });
    setStatusMessage('DROP: Nível 1 descartado.');
    setStatusType('info');
  }, []);

  const handleClear = useCallback(() => {
    playKeyClick('clear');
    setIsTyping(false);
    setCurrentEntry('');
    setLevels([0, 0, 0, 0, 0]);
    addLog('CLEAR (AC)', 'Todos os 5 níveis da pilha foram zerados.');
    setStatusMessage('Pilha reiniciada (todos os 5 níveis zerados).');
    setStatusType('info');
  }, []);

  const handleRollDown = useCallback(() => {
    playKeyClick('num');
    setIsTyping(false);
    setCurrentEntry('');
    setLevels((lvl) => {
      const newLvl = [lvl[1], lvl[2], lvl[3], lvl[4], lvl[0]];
      addLog('ROLL ↓', `Giro para baixo: Nível 1 foi para Nível 5.`);
      return newLvl;
    });
    setStatusMessage('ROLL ↓: Pilha rotacionada para baixo.');
    setStatusType('info');
  }, []);

  // Atalhos de teclado físico
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignora se estiver digitando em um input ou textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === '.' || e.key === ',') {
        e.preventDefault();
        handleDot();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleEnter();
      } else if (e.key === '+') {
        e.preventDefault();
        handleOperation('+');
      } else if (e.key === '-') {
        e.preventDefault();
        handleOperation('-');
      } else if (e.key === '*') {
        e.preventDefault();
        handleOperation('*');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperation('/');
      } else if (e.key === '%') {
        e.preventDefault();
        handlePercent();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigit, handleDot, handleEnter, handleOperation, handlePercent, handleBackspace, handleClear]);

  // Função para carregar exemplos interativos
  const runExample = (
    steps: Array<{ val?: number; op?: '+' | '-' | '*' | '/'; action?: 'enter' | 'swap' | 'percent' }>,
    desc: string
  ) => {
    handleClear();
    setStatusMessage(`Executando exemplo: ${desc}...`);
    setStatusType('info');

    let currentLvl = [0, 0, 0, 0, 0];
    let stepIndex = 0;

    const timer = setInterval(() => {
      if (stepIndex >= steps.length) {
        clearInterval(timer);
        setStatusMessage(`Exemplo concluído: ${desc}`);
        setStatusType('success');
        return;
      }

      const step = steps[stepIndex];
      if (step.val !== undefined) {
        currentLvl[0] = step.val;
        setLevels([...currentLvl]);
        addLog('INPUT', `Inserido ${step.val}`);
      } else if (step.action === 'enter') {
        currentLvl = [currentLvl[0], currentLvl[0], currentLvl[1], currentLvl[2], currentLvl[3]];
        setLevels([...currentLvl]);
        addLog('ENTER', 'Empurrado para Nível 2');
      } else if (step.action === 'percent') {
        const x = currentLvl[0];
        const y = currentLvl[1];
        const r = y !== 0 ? (y * x) / 100.0 : x / 100.0;
        currentLvl = [r, currentLvl[1], currentLvl[2], currentLvl[3], currentLvl[4]];
        setLevels([...currentLvl]);
        addLog('%', `${formatNumber(x)}% de ${formatNumber(y)} = ${formatNumber(r)} (Base mantida em L2)`);
      } else if (step.op) {
        const x = currentLvl[0];
        const y = currentLvl[1];
        let r = 0;
        if (step.op === '+') r = y + x;
        if (step.op === '-') r = y - x;
        if (step.op === '*') r = y * x;
        if (step.op === '/') r = y / x;
        currentLvl = [r, currentLvl[2], currentLvl[3], currentLvl[4], 0];
        setLevels([...currentLvl]);
        addLog(step.op, `Resultado: ${formatNumber(r)}`);
      }
      stepIndex++;
    }, 450);
  };

  const levelConfigs = [
    { num: 5, label: 'Nível 5 (U)', desc: 'Topo da pilha limite (overflow buffer)', color: 'text-slate-400', border: 'border-slate-800' },
    { num: 4, label: 'Nível 4 (T)', desc: 'Quarto operando retido', color: 'text-slate-300', border: 'border-slate-800' },
    { num: 3, label: 'Nível 3 (Z)', desc: 'Terceiro operando retido', color: 'text-slate-300', border: 'border-slate-800' },
    { num: 2, label: 'Nível 2 (Y)', desc: 'Primeiro operando em operações binárias (Y operado por X)', color: 'text-amber-300 font-semibold', border: 'border-amber-500/30 bg-amber-500/5' },
    { num: 1, label: 'Nível 1 (X)', desc: 'Registro Ativo / Entrada atual (segundo operando)', color: 'text-emerald-300 font-bold text-lg', border: 'border-emerald-500/50 bg-emerald-500/10' },
  ];

  return (
    <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Coluna Principal: Calculadora RPN Física Interativa */}
      <div className="lg:col-span-7 xl:col-span-6 flex flex-col items-center">
        <div className="w-full max-w-md bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-800 relative">
          {/* Header da Calculadora */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="text-white font-bold tracking-wide text-sm uppercase">RPN-5000 Pro</h3>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                Pilha 5 Níveis
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMuted(toggleAudioMute())}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title={isMuted ? 'Ativar sons de clique' : 'Mutar sons'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
              <button
                type="button"
                onClick={handleRollDown}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-1 text-xs"
                title="Girar pilha para baixo (Roll Down)"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>ROLL</span>
              </button>
            </div>
          </div>

          {/* Display Visual dos 5 Níveis */}
          <div className="bg-slate-950 rounded-2xl p-3.5 border border-slate-800/80 shadow-inner mb-3 space-y-1.5">
            <div className="flex justify-between items-center text-[11px] text-slate-500 px-1 pb-1 border-b border-slate-900">
              <span>REGISTRO / NÍVEL DA PILHA</span>
              <span>VALOR NUMÉRICO</span>
            </div>

            {levelConfigs.map(({ num, label, desc, color, border }) => {
              const val = levels[num - 1];
              const isL1 = num === 1;
              const isHighlighted = highlightLevel === num;

              return (
                <div
                  key={num}
                  title={desc}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-xl border transition-all duration-150 ${border} ${
                    isHighlighted ? 'scale-[1.02] bg-emerald-500/20' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">{label}</span>
                    {isL1 && (
                      <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded">
                        {isTyping ? 'ENTRADA' : 'TOPO'}
                      </span>
                    )}
                    {num === 2 && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded">
                        BASE OP
                      </span>
                    )}
                  </div>
                  <div className={`font-mono text-right select-all ${color}`}>
                    {isL1 && isTyping ? currentEntry || '0' : formatNumber(val)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Barra de Status e Feedback */}
          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-medium mb-3 flex items-center gap-2 border transition-all ${
              statusType === 'error'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : statusType === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-300'
            }`}
          >
            {statusType === 'error' ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            ) : statusType === 'success' ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
            <span className="truncate">{statusMessage}</span>
          </div>

          {/* Teclado da Calculadora */}
          <div className="grid grid-cols-4 gap-2">
            {/* Linha 1: Utilitários RPN */}
            <button
              type="button"
              onClick={handleClear}
              className="py-3 px-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs tracking-wider transition active:scale-95 flex items-center justify-center gap-1 shadow-sm"
              title="Limpar todos os 5 níveis (AC)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              CLEAR
            </button>

            <button
              type="button"
              onClick={handleDrop}
              className="py-3 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs tracking-wider transition active:scale-95 flex items-center justify-center gap-1 shadow-sm"
              title="Descartar Nível 1 (DROP)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              DROP
            </button>

            <button
              type="button"
              onClick={handleSwap}
              className="py-3 px-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-bold text-xs tracking-wider transition active:scale-95 flex items-center justify-center gap-1 shadow-sm"
              title="Trocar Nível 1 e Nível 2 (SWAP X⇄Y)"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              SWAP
            </button>

            <button
              type="button"
              onClick={handlePercent}
              className="py-3 px-2 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 font-bold text-xs tracking-wider transition active:scale-95 flex items-center justify-center gap-1 shadow-sm"
              title="Porcentagem RPN (%): Calcula taxa de L2 mantendo L2 como base"
            >
              <Percent className="w-3.5 h-3.5" />
              %
            </button>

            {/* Linha 2: 7, 8, 9, ÷ */}
            {['7', '8', '9'].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => handleDigit(d)}
                className="py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-white font-bold text-lg transition active:scale-95 shadow-sm"
              >
                {d}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleOperation('/')}
              className="py-3 px-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition active:scale-95 shadow-md shadow-blue-900/30 flex items-center justify-center"
              title="Divisão: Nível 2 / Nível 1"
            >
              ÷
            </button>

            {/* Linha 3: 4, 5, 6, × */}
            {['4', '5', '6'].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => handleDigit(d)}
                className="py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-white font-bold text-lg transition active:scale-95 shadow-sm"
              >
                {d}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleOperation('*')}
              className="py-3 px-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition active:scale-95 shadow-md shadow-blue-900/30 flex items-center justify-center"
              title="Multiplicação: Nível 2 × Nível 1"
            >
              ×
            </button>

            {/* Linha 4: 1, 2, 3, − */}
            {['1', '2', '3'].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => handleDigit(d)}
                className="py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-white font-bold text-lg transition active:scale-95 shadow-sm"
              >
                {d}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleOperation('-')}
              className="py-3 px-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition active:scale-95 shadow-md shadow-blue-900/30 flex items-center justify-center"
              title="Subtração: Nível 2 - Nível 1"
            >
              −
            </button>

            {/* Linha 5: ±, 0, ., + */}
            <button
              type="button"
              onClick={handleToggleSign}
              className="py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold text-base transition active:scale-95"
              title="Inverter sinal (+ / -)"
            >
              ±
            </button>

            <button
              type="button"
              onClick={() => handleDigit('0')}
              className="py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-white font-bold text-lg transition active:scale-95 shadow-sm"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleDot}
              className="py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-lg transition active:scale-95"
              title="Ponto decimal"
            >
              .
            </button>

            <button
              type="button"
              onClick={() => handleOperation('+')}
              className="py-3 px-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition active:scale-95 shadow-md shadow-blue-900/30 flex items-center justify-center"
              title="Soma: Nível 2 + Nível 1"
            >
              +
            </button>

            {/* Linha 6: ENTER ↵ (botão amplo com destaque) */}
            <button
              type="button"
              onClick={handleEnter}
              className="col-span-4 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm tracking-wide uppercase transition active:scale-95 shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-1"
              title="Confirmar entrada e empilhar para o Nível 2 (ENTER)"
            >
              ENTER ↵
            </button>
          </div>

          {/* Dica de Teclado Físico */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>💡 Dica: Use seu teclado numérico físico!</span>
            <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">Enter / Esc / % / + - * /</span>
          </div>
        </div>
      </div>

      {/* Coluna Lateral: Demonstrações Rápidas & Histórico da Pilha */}
      <div className="lg:col-span-5 xl:col-span-6 space-y-6">
        {/* Card: Demonstrações Rápidas (Exemplos Prontos) */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h4 className="text-white font-semibold text-sm">Testar Expressões Prontas</h4>
          </div>
          <p className="text-slate-400 text-xs mb-4">
            Clique em qualquer expressão para ver a pilha de 5 níveis calculando passo a passo automaticamente:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() =>
                runExample(
                  [
                    { val: 200 },
                    { action: 'enter' },
                    { val: 15 },
                    { action: 'percent' },
                    { op: '+' },
                  ],
                  '200 + 15% (Acréscimo de 15%) = 230'
                )
              }
              className="text-left p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 transition group"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-white group-hover:text-amber-300">
                <span>200 + 15% (Taxa)</span>
                <Play className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                200 ↵ 15 % + ➔ 230
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                runExample(
                  [
                    { val: 150 },
                    { action: 'enter' },
                    { val: 20 },
                    { action: 'percent' },
                    { op: '-' },
                  ],
                  '150 - 20% (Desconto de 20%) = 120'
                )
              }
              className="text-left p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 transition group"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-white group-hover:text-amber-300">
                <span>150 - 20% (Desconto)</span>
                <Play className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                150 ↵ 20 % − ➔ 120
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                runExample(
                  [
                    { val: 15 },
                    { action: 'enter' },
                    { val: 25 },
                    { op: '+' },
                    { action: 'enter' },
                    { val: 3 },
                    { op: '*' },
                  ],
                  '(15 + 25) × 3 = 120'
                )
              }
              className="text-left p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 transition group"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-white group-hover:text-emerald-400">
                <span>(15 + 25) × 3</span>
                <Play className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                15 ↵ 25 + ↵ 3 * ➔ 120
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                runExample(
                  [
                    { val: 100 },
                    { action: 'enter' },
                    { val: 4 },
                    { action: 'enter' },
                    { val: 5 },
                    { op: '*' },
                    { op: '/' },
                  ],
                  '100 ÷ (4 × 5) = 5'
                )
              }
              className="text-left p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 transition group"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-white group-hover:text-emerald-400">
                <span>100 ÷ (4 × 5)</span>
                <Play className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                100 ↵ 4 ↵ 5 * / ➔ 5
              </div>
            </button>
          </div>
        </div>

        {/* Card: Histórico de Transições da Pilha */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              <h4 className="text-white font-semibold text-sm">Registro de Operações da Pilha</h4>
            </div>
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => setHistory([])}
                className="text-[11px] text-slate-400 hover:text-rose-400 transition"
              >
                Limpar Log
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="py-6 text-center text-slate-500 text-xs">
              Nenhuma operação registrada ainda. Pressione dígitos, ENTER ou operações (+, -, *, /, %) para acompanhar.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between text-xs p-2 rounded-lg bg-slate-950/60 border border-slate-800/80"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[11px]">
                      {item.action}
                    </span>
                    <span className="text-slate-300 font-mono text-[11px]">{item.detail}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 font-mono">{item.timestamp}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card: Guia de Teclas Rápidas */}
        <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800/80 text-xs text-slate-400 space-y-2">
          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span>Guia Rápido dos Botões RPN:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <strong className="text-emerald-400">ENTER:</strong> Duplica L1 para L2 e sobe os demais níveis.
            </div>
            <div>
              <strong className="text-amber-400">% (Porcento):</strong> Taxa sobre base L2, mantendo L2 para + ou −.
            </div>
            <div>
              <strong className="text-purple-400">SWAP:</strong> Inverte os valores de X (L1) e Y (L2).
            </div>
            <div>
              <strong className="text-orange-400">DROP:</strong> Descarta o Nível 1 e desce a pilha.
            </div>
            <div className="col-span-2">
              <strong className="text-rose-400">CLEAR:</strong> Zera instantaneamente os 5 níveis da pilha.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

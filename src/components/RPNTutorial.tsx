import React, { useState } from 'react';
import {
  HelpCircle,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2,
  Cpu,
  Calculator,
  ChevronRight
} from 'lucide-react';

interface TutorialStep {
  step: number;
  input: string;
  action: string;
  stackBefore: number[];
  stackAfter: number[];
  explanation: string;
}

export const RPNTutorial: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'basics' | 'comparison' | 'interactive'>('basics');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Exemplo passo a passo interativo: Calcular (5 + 3) * 4
  const steps: TutorialStep[] = [
    {
      step: 1,
      input: '5',
      action: 'Digitar 5',
      stackBefore: [0, 0, 0, 0, 0],
      stackAfter: [5, 0, 0, 0, 0],
      explanation: 'O número 5 é digitado e entra no Nível 1 (X).',
    },
    {
      step: 2,
      input: 'ENTER',
      action: 'Pressionar ENTER ↵',
      stackBefore: [5, 0, 0, 0, 0],
      stackAfter: [5, 5, 0, 0, 0],
      explanation: 'A tecla ENTER confirma o valor e empurra para o Nível 2 (Y), liberando o Nível 1 para o próximo número.',
    },
    {
      step: 3,
      input: '3',
      action: 'Digitar 3',
      stackBefore: [5, 5, 0, 0, 0],
      stackAfter: [3, 5, 0, 0, 0],
      explanation: 'O número 3 entra no Nível 1. Agora temos: Nível 2 = 5 e Nível 1 = 3.',
    },
    {
      step: 4,
      input: '+',
      action: 'Pressionar +',
      stackBefore: [3, 5, 0, 0, 0],
      stackAfter: [8, 0, 0, 0, 0],
      explanation: 'A operação de soma pega o Nível 2 (5) e soma com o Nível 1 (3). O resultado 8 é colocado no Nível 1 e a pilha desce.',
    },
    {
      step: 5,
      input: 'ENTER',
      action: 'Pressionar ENTER ↵',
      stackBefore: [8, 0, 0, 0, 0],
      stackAfter: [8, 8, 0, 0, 0],
      explanation: 'O resultado parcial 8 sobe para o Nível 2 para ser multiplicado em seguida.',
    },
    {
      step: 6,
      input: '4',
      action: 'Digitar 4',
      stackBefore: [8, 8, 0, 0, 0],
      stackAfter: [4, 8, 0, 0, 0],
      explanation: 'Digitamos o multiplicador 4 no Nível 1.',
    },
    {
      step: 7,
      input: '*',
      action: 'Pressionar ×',
      stackBefore: [4, 8, 0, 0, 0],
      stackAfter: [32, 0, 0, 0, 0],
      explanation: 'Multiplicação de Nível 2 (8) por Nível 1 (4) = 32. Resultado final pronto no Nível 1!',
    },
  ];

  const currentStep = steps[currentStepIndex];

  return (
    <div className="space-y-6">
      {/* Navegação entre subtópicos */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('basics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'basics'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>O que é RPN & Pilha de 5 Níveis</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('interactive')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'interactive'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Simulador Interativo Passo a Passo</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('comparison')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'comparison'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>RPN vs Notação Algébrica Tradicional</span>
        </button>
      </div>

      {/* Conteúdo Aba 1: Fundamentos */}
      {activeTab === 'basics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Cpu className="w-5 h-5" />
              <span>Origem da Notação Polonesa Reversa</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Criada pelo lógico e matemático polonês <strong>Jan Łukasiewicz</strong> em 1924 e popularizada pela <strong>Hewlett-Packard (HP)</strong> nas calculadoras de engenharia (como as lendárias HP-35, HP-12C e HP-48G).
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              Na RPN, os <strong>operandos entram primeiro</strong> na pilha de memória, e o <strong>operador é aplicado logo em seguida</strong>.
            </p>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="font-semibold text-white">Por que engenheiros preferem RPN?</div>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                <li><strong>Zero Parênteses:</strong> Nunca mais se perca abrindo e fechando parênteses em cálculos longos.</li>
                <li><strong>Resultados Imediatos:</strong> Cada operação exibe o resultado parcial na hora.</li>
                <li><strong>Menos Teclas:</strong> Reduz o número total de toques em mais de 30%.</li>
                <li><strong>Pilha como Rascunho:</strong> Valores intermediários ficam guardados nos níveis superiores.</li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Layers className="w-5 h-5" />
              <span>Anatomia dos 5 Níveis da Pilha</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Nossa implementação Python adota uma pilha de <strong>5 níveis de capacidade fixa</strong>, gerenciando o fluxo LIFO (Last-In, First-Out):
            </p>

            <div className="space-y-2 font-mono text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Nível 5 (U)</span>
                <span className="text-slate-500 text-[11px]">Limite superior / buffer</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Nível 4 (T)</span>
                <span className="text-slate-400 text-[11px]">Armazenamento intermediário</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Nível 3 (Z)</span>
                <span className="text-slate-400 text-[11px]">Armazenamento intermediário</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex justify-between items-center text-amber-300">
                <span>Nível 2 (Y)</span>
                <span className="text-[11px] font-sans font-medium">Primeiro operando (Base)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 flex justify-between items-center text-emerald-300 font-bold">
                <span>Nível 1 (X)</span>
                <span className="text-[11px] font-sans font-medium">Registro Ativo / Entrada</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Aba 2: Passo a Passo Interativo */}
      {activeTab === 'interactive' && (
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h4 className="text-white font-bold text-sm">
                Exemplo Passo a Passo: Calcular <code className="text-emerald-400 bg-slate-800 px-2 py-0.5 rounded">(5 + 3) × 4</code>
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Avance os passos abaixo para ver os números subindo e descendo nos 5 níveis da pilha.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentStepIndex((p) => Math.max(0, p - 1))}
                disabled={currentStepIndex === 0}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-xs font-semibold transition"
              >
                Anterior
              </button>
              <span className="text-xs font-mono text-slate-300 px-2">
                {currentStepIndex + 1} de {steps.length}
              </span>
              <button
                type="button"
                onClick={() => setCurrentStepIndex((p) => Math.min(steps.length - 1, p + 1))}
                disabled={currentStepIndex === steps.length - 1}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white text-xs font-semibold transition flex items-center gap-1"
              >
                <span>Próximo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Visualização da Pilha neste passo */}
            <div className="md:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                Estado da Pilha (Passo {currentStep.step}):
              </div>
              {[5, 4, 3, 2, 1].map((lvlNum) => {
                const val = currentStep.stackAfter[lvlNum - 1];
                const isL1 = lvlNum === 1;
                const isL2 = lvlNum === 2;
                return (
                  <div
                    key={lvlNum}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-mono ${
                      isL1
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                        : isL2
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    <span>Nível {lvlNum}</span>
                    <span className="text-white text-sm">{val}</span>
                  </div>
                );
              })}
            </div>

            {/* Explicação do Passo */}
            <div className="md:col-span-7 space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-xs font-mono font-bold">
                    Tecla: {currentStep.action}
                  </span>
                </div>
                <p className="text-sm text-white font-medium">
                  {currentStep.explanation}
                </p>
              </div>

              <div className="flex gap-2">
                {steps.map((s, idx) => (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-mono font-bold transition ${
                      idx === currentStepIndex
                        ? 'bg-emerald-600 text-white'
                        : idx < currentStepIndex
                        ? 'bg-slate-800 text-emerald-400'
                        : 'bg-slate-900 text-slate-600'
                    }`}
                  >
                    {s.input}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Aba 3: Comparação de Notações */}
      {activeTab === 'comparison' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-3">
            <h4 className="text-rose-400 font-bold text-sm">Calculadora Tradicional (Infixa)</h4>
            <p className="text-xs text-slate-400">
              Para calcular <code className="text-white bg-slate-800 px-1 rounded">(10 + 20) / (8 - 3)</code>:
            </p>
            <div className="p-3 bg-slate-950 rounded-xl font-mono text-xs text-slate-300 space-y-2 border border-slate-800">
              <div>1. Pressionar "("</div>
              <div>2. Digitar "10"</div>
              <div>3. Pressionar "+"</div>
              <div>4. Digitar "20"</div>
              <div>5. Pressionar ")"</div>
              <div>6. Pressionar "÷"</div>
              <div>7. Pressionar "("</div>
              <div>8. Digitar "8"</div>
              <div>9. Pressionar "−"</div>
              <div>10. Digitar "3"</div>
              <div>11. Pressionar ")"</div>
              <div>12. Pressionar "="</div>
              <div className="pt-2 text-rose-300 font-bold text-[11px]">
                Total: 12 toques de tecla e alto risco de esquecer parênteses!
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 border border-emerald-500/30 space-y-3">
            <h4 className="text-emerald-400 font-bold text-sm">Calculadora RPN (Posfixa)</h4>
            <p className="text-xs text-slate-400">
              Para o mesmo cálculo <code className="text-white bg-slate-800 px-1 rounded">(10 + 20) / (8 - 3)</code>:
            </p>
            <div className="p-3 bg-slate-950 rounded-xl font-mono text-xs text-slate-300 space-y-2 border border-emerald-500/20">
              <div>1. Digitar <span className="text-emerald-400">10 [ENTER] 20 [+]</span> ➔ 30</div>
              <div>2. Pressionar <span className="text-emerald-400">[ENTER]</span> (guarda o 30 no Nível 2)</div>
              <div>3. Digitar <span className="text-emerald-400">8 [ENTER] 3 [−]</span> ➔ 5</div>
              <div>4. Pressionar <span className="text-emerald-400">[÷]</span> ➔ 6.0</div>
              <div className="pt-2 text-emerald-300 font-bold text-[11px]">
                Total: 8 toques, sem parênteses, com validação de cada resultado parcial na tela!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

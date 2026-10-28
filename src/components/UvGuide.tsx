import React, { useState } from 'react';
import {
  Terminal,
  Zap,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Box,
  Layers,
  Sparkles
} from 'lucide-react';

export const UvGuide: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [platform, setPlatform] = useState<'linux_mac' | 'windows'>('linux_mac');

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const installCommands = {
    linux_mac: 'curl -LsSf https://astral.sh/uv/install.sh | sh',
    windows: 'powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"',
  };

  const workflows = [
    {
      title: '1. Instalar o uv (apenas 1 comando)',
      cmd: installCommands[platform],
      desc: 'O uv é instalado como binário único em Rust, sem depender de nenhuma versão pré-instalada de Python.',
    },
    {
      title: '2. Executar a Calculadora Imediatamente',
      cmd: 'uv run calculadora',
      desc: 'O uv cria o ambiente virtual em milissegundos, resolve as configurações do pyproject.toml e abre a janela da interface gráfica.',
    },
    {
      title: '3. Executar os Testes Automatizados da Pilha',
      cmd: 'uv run pytest',
      desc: 'Roda a suíte com testes de soma, subtração, multiplicação, divisão, divisão por zero e limite de 5 níveis.',
    },
    {
      title: '4. Adicionar Novas Bibliotecas Futuras (ex: CustomTkinter)',
      cmd: 'uv add customtkinter',
      desc: 'Adiciona e bloqueia dependências instantaneamente com resolução determinística no uv.lock.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Banner Principal do uv */}
      <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-900 border border-purple-500/30 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
            <Zap className="w-5 h-5" />
          </span>
          <span className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">
            Gestor de Pacotes de Próxima Geração
          </span>
        </div>
        <h3 className="text-xl font-bold text-white">Por que o Astral \`uv\` foi escolhido para este projeto?</h3>
        <p className="text-slate-300 text-xs leading-relaxed max-w-3xl">
          O <strong>uv</strong> é uma ferramenta revolucionária para o ecossistema Python desenvolvida em <strong>Rust</strong> pela <em>Astral</em> (mesmos criadores do Ruff). Ele unifica e substitui completamente ferramentas como <code className="text-purple-300">pip</code>, <code className="text-purple-300">pip-tools</code>, <code className="text-purple-300">virtualenv</code>, <code className="text-purple-300">pyenv</code> e <code className="text-purple-300">poetry</code>, oferecendo velocidades de <strong>10 a 100 vezes superiores</strong>.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-purple-400 font-bold text-base">10-100x</div>
            <div className="text-[11px] text-slate-400">Mais rápido que o pip</div>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-emerald-400 font-bold text-base">Zero Config</div>
            <div className="text-[11px] text-slate-400">Auto-cria .venv</div>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-blue-400 font-bold text-base">PEP 621</div>
            <div className="text-[11px] text-slate-400">pyproject.toml padrão</div>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-amber-400 font-bold text-base">Escrito em Rust</div>
            <div className="text-[11px] text-slate-400">Binário único ultraleve</div>
          </div>
        </div>
      </div>

      {/* Seletor de Sistema Operacional */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h4 className="text-white font-bold text-sm flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Passo a Passo de Comandos</span>
          </h4>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setPlatform('linux_mac')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                platform === 'linux_mac'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Linux / macOS
            </button>
            <button
              type="button"
              onClick={() => setPlatform('windows')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                platform === 'windows'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Windows (PowerShell)
            </button>
          </div>
        </div>

        {/* Lista de Comandos */}
        <div className="space-y-4">
          {workflows.map((item, index) => (
            <div key={index} className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                <span>{item.title}</span>
              </div>
              <p className="text-[11px] text-slate-400">{item.desc}</p>

              <div className="flex items-center justify-between bg-slate-900 px-3 py-2.5 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
                <span className="whitespace-pre select-all">{item.cmd}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(item.cmd, index)}
                  className="ml-3 shrink-0 p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                  title="Copiar comando"
                >
                  {copiedIndex === index ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabela de Referência Rápida: uv vs pip clássico */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-4">
        <h4 className="text-white font-bold text-sm">Tabela Comparativa: uv vs Métodos Antigos</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="py-2.5 px-3">Tarefa</th>
                <th className="py-2.5 px-3">Como era com pip / venv</th>
                <th className="py-2.5 px-3 text-emerald-400">Como é agora com uv ✨</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 font-mono text-[11px]">
              <tr>
                <td className="py-2.5 px-3 font-sans text-white">Criar ambiente virtual</td>
                <td className="py-2.5 px-3 text-slate-400">python -m venv .venv</td>
                <td className="py-2.5 px-3 text-emerald-400">uv venv (ou automático no uv run)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans text-white">Ativar ambiente</td>
                <td className="py-2.5 px-3 text-slate-400">source .venv/bin/activate ou .venv\Scripts\activate</td>
                <td className="py-2.5 px-3 text-emerald-400">Não precisa! uv run ativa na hora</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans text-white">Instalar e rodar app</td>
                <td className="py-2.5 px-3 text-slate-400">pip install -e . && python src/main.py</td>
                <td className="py-2.5 px-3 text-emerald-400">uv run calculadora</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans text-white">Instalar pacote</td>
                <td className="py-2.5 px-3 text-slate-400">pip install pytest && pip freeze &gt; req.txt</td>
                <td className="py-2.5 px-3 text-emerald-400">uv add --dev pytest</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans text-white">Velocidade de instalação</td>
                <td className="py-2.5 px-3 text-slate-400">30 - 60 segundos</td>
                <td className="py-2.5 px-3 text-emerald-400">0.2 - 1.5 segundos ⚡</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

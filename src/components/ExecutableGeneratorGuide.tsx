import React, { useState } from 'react';
import {
  Monitor,
  Apple,
  Terminal,
  Cpu,
  Download,
  Copy,
  Check,
  Package,
  Layers,
  Sparkles,
  ExternalLink,
  Github,
  Play,
  FileCode,
  FolderArchive
} from 'lucide-react';
import { downloadSingleFile, downloadPythonProjectZip } from '../utils/zipExporter';

type OSTarget = 'windows' | 'linux' | 'macos';
type BuildTool = 'pyinstaller' | 'nuitka';

export const ExecutableGeneratorGuide: React.FC = () => {
  const [selectedOS, setSelectedOS] = useState<OSTarget>('windows');
  const [selectedTool, setSelectedTool] = useState<BuildTool>('pyinstaller');
  const [isOneFile, setIsOneFile] = useState<boolean>(true);
  const [isWindowed, setIsWindowed] = useState<boolean>(true);
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);
  const [downloadingZip, setDownloadingZip] = useState<boolean>(false);

  const getCommand = (): string => {
    if (selectedTool === 'pyinstaller') {
      const flags = [
        isOneFile ? '--onefile' : '--onedir',
        isWindowed ? (selectedOS === 'windows' ? '--noconsole' : '--windowed') : '',
        selectedOS === 'macos'
          ? '--name "Calculadora RPN" --osx-bundle-identifier com.calculadora.rpn'
          : '--name "calculadora-rpn"',
        'src/calculadora_rpn/main.py',
      ]
        .filter(Boolean)
        .join(' ');

      return `uv run pyinstaller ${flags}`;
    } else {
      // Nuitka (compilador C nativo)
      const flags = [
        isOneFile ? '--onefile' : '--standalone',
        isWindowed ? '--windows-disable-console' : '',
        '--enable-plugin=tk',
        '--output-dir=dist',
        'src/calculadora_rpn/main.py',
      ]
        .filter(Boolean)
        .join(' ');

      return `uv run nuitka ${flags}`;
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleDownloadZip = async () => {
    setDownloadingZip(true);
    try {
      await downloadPythonProjectZip();
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingZip(false);
    }
  };

  const osDetails = {
    windows: {
      name: 'Windows',
      icon: <Monitor className="w-5 h-5 text-blue-400" />,
      ext: '.exe',
      output: 'dist/calculadora-rpn.exe',
      desc: 'Gera um executável portátil independente (.exe). Não requer Python instalado no Windows do usuário final.',
      runHint: '.\\dist\\calculadora-rpn.exe',
      bgClass: 'hover:border-blue-500/40',
      activeClass: 'border-blue-500 bg-blue-500/10 text-white',
    },
    linux: {
      name: 'Linux',
      icon: <Terminal className="w-5 h-5 text-amber-400" />,
      ext: ' (ELF binário)',
      output: 'dist/calculadora-rpn',
      desc: 'Gera um executável nativo ELF para distribuições Linux (Ubuntu, Debian, Fedora, Arch, etc.).',
      runHint: './dist/calculadora-rpn',
      bgClass: 'hover:border-amber-500/40',
      activeClass: 'border-amber-500 bg-amber-500/10 text-white',
    },
    macos: {
      name: 'macOS',
      icon: <Apple className="w-5 h-5 text-slate-200" />,
      ext: '.app bundle',
      output: 'dist/Calculadora RPN.app',
      desc: 'Gera um pacote nativo de aplicativo macOS (.app) pronto para rodar com duplo clique no Finder.',
      runHint: 'open "dist/Calculadora RPN.app"',
      bgClass: 'hover:border-slate-400/40',
      activeClass: 'border-slate-300 bg-slate-800 text-white',
    },
  };

  const currentOS = osDetails[selectedOS];

  return (
    <div className="space-y-6">
      {/* Banner Principal */}
      <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-900 border border-blue-500/30 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
              <Package className="w-5 h-5" />
            </span>
            <span className="text-xs font-mono font-bold text-blue-300 uppercase tracking-wider">
              Compilação de Binários Nativos Independentes
            </span>
          </div>

          <button
            type="button"
            onClick={handleDownloadZip}
            disabled={downloadingZip}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            <FolderArchive className="w-4 h-4" />
            <span>{downloadingZip ? 'Baixando...' : 'Baixar Projeto com Scripts (.zip)'}</span>
          </button>
        </div>

        <h3 className="text-xl font-bold text-white">
          Gerar Executáveis Nativos para Linux, macOS e Windows
        </h3>
        <p className="text-slate-300 text-xs leading-relaxed max-w-3xl">
          Transforme a Calculadora RPN em um <strong>arquivo executável autônomo</strong> que pode ser distribuído para qualquer usuário, mesmo que ele <strong>não tenha Python nem o uv instalados</strong>. O executável já embute o interpretador, o Tkinter e todo o código em um único arquivo.
        </p>
      </div>

      {/* Seletor de Sistema Operacional */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.keys(osDetails) as OSTarget[]).map((osKey) => {
          const item = osDetails[osKey];
          const isSelected = selectedOS === osKey;
          return (
            <button
              key={osKey}
              type="button"
              onClick={() => setSelectedOS(osKey)}
              className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-3 ${
                isSelected
                  ? item.activeClass
                  : 'bg-slate-900/90 border-slate-800 text-slate-400 ' + item.bgClass
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span className="font-bold text-sm text-white">{item.name}</span>
                </div>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  {item.ext}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              <div className="text-[11px] font-mono text-emerald-400 truncate">
                Saída: {item.output}
              </div>
            </button>
          );
        })}
      </div>

      {/* Painel de Configuração do Build */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Esquerda: Opções de Compilação */}
        <div className="lg:col-span-5 bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-5 shadow-lg">
          <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-3">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span>Opções do Gerador</span>
          </div>

          {/* Escolha da Ferramenta */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Ferramenta de Empacotamento:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedTool('pyinstaller')}
                className={`p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer text-left ${
                  selectedTool === 'pyinstaller'
                    ? 'border-blue-500 bg-blue-500/10 text-white font-bold'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-semibold">PyInstaller (Padrão)</div>
                <div className="text-[10px] text-slate-400">Rápido, testado e oficial</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTool('nuitka')}
                className={`p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer text-left ${
                  selectedTool === 'nuitka'
                    ? 'border-blue-500 bg-blue-500/10 text-white font-bold'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-semibold">Nuitka (C Nativo)</div>
                <div className="text-[10px] text-slate-400">Compilação C++ de alto desempenho</div>
              </button>
            </div>
          </div>

          {/* Opções de Saída */}
          <div className="space-y-3 pt-1">
            <label className="text-xs font-semibold text-slate-300 block">
              Configurações do Executável:
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isOneFile}
                onChange={(e) => setIsOneFile(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-0 bg-slate-800 border-slate-700 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-semibold text-white block">Arquivo Único Portátil (--onefile)</span>
                <span className="text-[11px] text-slate-400">
                  Empacota tudo em um só arquivo sem necessidade de pasta com dependências soltas.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isWindowed}
                onChange={(e) => setIsWindowed(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-0 bg-slate-800 border-slate-700 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-semibold text-white block">Ocultar Janela de Terminal (--windowed)</span>
                <span className="text-[11px] text-slate-400">
                  Abre apenas a interface gráfica limpa, sem a tela preta do terminal atrás.
                </span>
              </div>
            </label>
          </div>

          {/* Método 1-Clique Automatizado via Script Python */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Script Automático Multiplataforma Incluso</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Criamos o arquivo <code className="text-slate-200">build_executable.py</code> no projeto. Ele detecta o sistema operacional atual e roda a configuração ideal:
            </p>
            <div className="bg-slate-900 p-2 rounded-lg font-mono text-emerald-300 text-xs flex justify-between items-center">
              <span>uv run python build_executable.py</span>
              <button
                type="button"
                onClick={() => handleCopy('uv run python build_executable.py')}
                className="text-slate-400 hover:text-white"
                title="Copiar"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Comandos Prontos e Passo a Passo */}
        <div className="lg:col-span-7 space-y-4">
          {/* Card com o Comando Gerado */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Comando Gerado para {currentOS.name}</span>
              </span>

              <button
                type="button"
                onClick={() => handleCopy(getCommand())}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
              >
                {copiedCmd ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd ? 'Copiado!' : 'Copiar Comando'}</span>
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono text-xs text-emerald-400 overflow-x-auto select-all leading-relaxed">
              {getCommand()}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Arquivo gerado:</span>
              <span className="font-mono text-white bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                {currentOS.output}
              </span>
            </div>
          </div>

          {/* Passo a Passo de Execução Local */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-3 shadow-lg text-xs">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-400" />
              <span>Passo a Passo no seu Computador</span>
            </h4>

            <div className="space-y-2.5">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <div>
                  <strong className="text-white">Instalar o PyInstaller no ambiente via uv:</strong>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Já configurado no <code className="text-blue-300">pyproject.toml</code> sob o grupo de desenvolvimento.
                  </p>
                  <div className="bg-slate-900 px-2 py-1 rounded font-mono text-slate-300 mt-1">
                    uv add --dev pyinstaller
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <div>
                  <strong className="text-white">Rodar o empacotamento:</strong>
                  <div className="bg-slate-900 px-2 py-1 rounded font-mono text-emerald-400 mt-1 select-all">
                    {getCommand()}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <div>
                  <strong className="text-white">Executar o binário final gerado:</strong>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    O arquivo gerado na pasta <code className="text-emerald-300">dist/</code> pode ser executado diretamente com dois cliques ou via terminal:
                  </p>
                  <div className="bg-slate-900 px-2 py-1 rounded font-mono text-slate-300 mt-1">
                    {currentOS.runHint}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Automação em Nuvem: GitHub Actions para gerar os 3 SOs de uma vez! */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl p-5 border border-purple-500/30 space-y-3 shadow-lg text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Github className="w-5 h-5 text-purple-400" />
                <h4 className="font-bold text-white text-sm">
                  Compilação Automática em Nuvem (Windows + Mac + Linux)
                </h4>
              </div>
              <span className="bg-purple-500/20 text-purple-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-purple-500/30">
                CI/CD Grátis
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed text-xs">
              Não tem um computador com Mac ou Windows disponível para compilar? Sem problemas! Incluímos no projeto o arquivo de fluxo <code className="text-purple-300 font-mono">.github/workflows/build-executables.yml</code>.
            </p>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5 text-[11px] text-slate-400">
              <div className="text-white font-semibold">Como funciona a compilação simultânea:</div>
              <ul className="list-disc list-inside space-y-1">
                <li>Você envia o código para o GitHub (git push).</li>
                <li>O GitHub Actions sobe máquinas virtuais reais de <strong>Ubuntu</strong>, <strong>Windows</strong> e <strong>macOS</strong>.</li>
                <li>Instala o <strong>uv</strong> e compila os 3 executáveis nativos simultaneamente em cerca de 45 segundos.</li>
                <li>Disponibiliza os 3 arquivos prontos para download na aba <em>Releases / Artifacts</em> do repositório!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

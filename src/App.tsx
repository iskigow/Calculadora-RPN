import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Code2,
  BookOpen,
  Zap,
  FolderArchive,
  Terminal,
  ExternalLink,
  Layers,
  Sparkles,
  Info,
  Package,
  Monitor,
  Apple,
  ChevronDown,
  Check
} from 'lucide-react';
import { RPNCalculatorSimulator } from './components/RPNCalculatorSimulator';
import { ProjectCodeViewer } from './components/ProjectCodeViewer';
import { RPNTutorial } from './components/RPNTutorial';
import { UvGuide } from './components/UvGuide';
import { ExecutableGeneratorGuide } from './components/ExecutableGeneratorGuide';
import {
  detectUserOS,
  downloadWindowsExecutable,
  downloadLinuxBinary,
  downloadMacAppBundle,
  downloadPythonProjectZip,
  DownloadOption
} from './utils/zipExporter';

type TabType = 'simulator' | 'code' | 'tutorial' | 'uv' | 'executables';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('simulator');
  const detectedOS = useMemo(() => detectUserOS(), []);
  const [selectedFormat, setSelectedFormat] = useState<DownloadOption>(() => {
    const os = detectUserOS();
    if (os === 'windows') return 'windows';
    if (os === 'linux') return 'linux';
    if (os === 'macos') return 'macos';
    return 'zip';
  });
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const formatConfig: Record<
    DownloadOption,
    {
      label: string;
      buttonText: string;
      icon: React.ReactNode;
      subtext: string;
      osMatch: string | null;
    }
  > = {
    windows: {
      label: 'Executável Windows (.exe)',
      buttonText: 'Baixar Executável (.exe)',
      icon: <Monitor className="w-4 h-4 text-blue-300" />,
      subtext: 'Pacote portátil para Windows com executável',
      osMatch: 'windows'
    },
    linux: {
      label: 'Binário Linux (ELF)',
      buttonText: 'Baixar Binário (ELF)',
      icon: <Terminal className="w-4 h-4 text-amber-300" />,
      subtext: 'Binário executável ELF nativo para Linux',
      osMatch: 'linux'
    },
    macos: {
      label: 'App Bundle macOS (.app)',
      buttonText: 'Baixar App Bundle (.app)',
      icon: <Apple className="w-4 h-4 text-slate-200" />,
      subtext: 'Pacote .app nativo para macOS',
      osMatch: 'macos'
    },
    zip: {
      label: 'Código Completo (.zip)',
      buttonText: 'Baixar Projeto (.zip)',
      icon: <FolderArchive className="w-4 h-4 text-emerald-300" />,
      subtext: 'Código Python puro gerenciado com uv',
      osMatch: null
    }
  };

  const handleDownload = async (format?: DownloadOption) => {
    const target = format || selectedFormat;
    setIsDownloading(true);
    setIsMenuOpen(false);
    try {
      if (target === 'windows') {
        await downloadWindowsExecutable();
      } else if (target === 'linux') {
        await downloadLinuxBinary();
      } else if (target === 'macos') {
        await downloadMacAppBundle();
      } else {
        await downloadPythonProjectZip();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Barra de Navegação Superior */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-900/40 text-white font-mono font-black text-lg border border-emerald-400/30">
              RPN
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-white font-bold text-base sm:text-lg tracking-tight">
                  Calculadora RPN em Python
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  5 Níveis
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Gestão uv
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Notação Polonesa Reversa • 4 Operações Aritméticas • Tkinter GUI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 relative">
            <div className="inline-flex rounded-xl shadow-md shadow-emerald-950/60 bg-emerald-600 hover:bg-emerald-500 transition">
              <button
                type="button"
                onClick={() => handleDownload()}
                disabled={isDownloading}
                className="px-3.5 py-2 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title={`Baixar ${formatConfig[selectedFormat].label}`}
              >
                {formatConfig[selectedFormat].icon}
                <span>
                  {isDownloading ? 'Baixando...' : formatConfig[selectedFormat].buttonText}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="px-2 py-2 border-l border-emerald-700/60 text-emerald-100 hover:text-white hover:bg-emerald-700/40 rounded-r-xl transition cursor-pointer"
                title="Escolher outro formato (Windows, Linux, macOS ou ZIP)"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Menu Dropdown de Formatos de Download */}
            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-2 space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 mb-1 flex items-center justify-between">
                    <span>Opções de Download</span>
                    <span className="text-emerald-400 font-semibold">SO: {detectedOS.toUpperCase()}</span>
                  </div>

                  {(Object.keys(formatConfig) as DownloadOption[]).map((fmt) => {
                    const cfg = formatConfig[fmt];
                    const isSelected = selectedFormat === fmt;
                    const isSuggested = cfg.osMatch === detectedOS;

                    return (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => {
                          setSelectedFormat(fmt);
                          handleDownload(fmt);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl transition flex items-center justify-between text-xs cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-950/60 border border-emerald-500/40 text-white'
                            : 'hover:bg-slate-800/80 text-slate-300 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="shrink-0">{cfg.icon}</span>
                          <div className="truncate">
                            <div className="font-semibold truncate flex items-center gap-1.5">
                              <span>{cfg.label}</span>
                              {isSuggested && (
                                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                                  Seu SO
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">{cfg.subtext}</div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Abas Principais */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto space-x-2 border-t border-slate-900 pt-1 pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>1. Simulador Interativo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'code'
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>2. Código</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tutorial')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'tutorial'
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>3. O que é RPN?</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('uv')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'uv'
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Zap className="w-4 h-4 text-purple-400" />
            <span>4. Guia uv</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('executables')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'executables'
                ? 'bg-slate-800 text-blue-400 border border-blue-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Package className="w-4 h-4 text-blue-400" />
            <span>5. Gerar Executáveis</span>
          </button>
        </div>
      </header>

      {/* Conteúdo Central */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'simulator' && <RPNCalculatorSimulator />}
        {activeTab === 'code' && <ProjectCodeViewer />}
        {activeTab === 'tutorial' && <RPNTutorial />}
        {activeTab === 'uv' && <UvGuide />}
        {activeTab === 'executables' && <ExecutableGeneratorGuide />}
      </main>

      {/* Rodapé Informativo */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Calculadora RPN com Pilha de 5 Níveis • Padrão PEP 517/621 com <span className="text-purple-400 font-semibold">uv</span> e Python
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>4 Operações (+, −, ×, ÷)</span>
            <span>•</span>
            <span>Tkinter Nativo</span>
            <span>•</span>
            <span>Pytest Incluído</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

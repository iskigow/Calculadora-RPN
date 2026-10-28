import React, { useState } from 'react';
import {
  FileCode,
  Copy,
  Check,
  Download,
  FolderArchive,
  Layers,
  Terminal,
  FileCheck2,
  BookOpen,
  Info
} from 'lucide-react';
import { PYTHON_PROJECT_FILES, ProjectFile } from '../data/pythonProjectFiles';
import { downloadSingleFile, downloadPythonProjectZip } from '../utils/zipExporter';

export const ProjectCodeViewer: React.FC = () => {
  const [activeFile, setActiveFile] = useState<ProjectFile>(PYTHON_PROJECT_FILES[0]);
  const [copied, setCopied] = useState<boolean>(false);
  const [downloadingZip, setDownloadingZip] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.py')) return <FileCode className="w-4 h-4 text-emerald-400" />;
    if (filename.endsWith('.toml')) return <Terminal className="w-4 h-4 text-amber-400" />;
    if (filename.endsWith('.md')) return <BookOpen className="w-4 h-4 text-blue-400" />;
    return <FileCheck2 className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner de Download e Destaques */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-500/30">
              Projeto Pronto com uv
            </span>
            <span className="text-slate-400 text-xs">Padrão PEP 517/621 + Tkinter</span>
          </div>
          <h3 className="text-white text-lg font-bold">Código-Fonte Completo e Organizado</h3>
          <p className="text-slate-300 text-xs max-w-2xl">
            Todos os arquivos prontos para rodar no seu computador com <code className="bg-slate-800 px-1 py-0.5 rounded text-emerald-400 font-mono">uv run calculadora</code>. Sem dependências pesadas, 100% nativo e tipado.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadZip}
          disabled={downloadingZip}
          className="shrink-0 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer disabled:opacity-50"
        >
          <FolderArchive className="w-4 h-4" />
          <span>{downloadingZip ? 'Gerando .zip...' : 'Baixar Projeto Completo (.zip)'}</span>
        </button>
      </div>

      {/* Editor & Navegador de Arquivos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Painel Esquerdo: Lista de Arquivos */}
        <div className="lg:col-span-4 space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Arquivos do Projeto Python
          </h4>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-2 space-y-1 shadow-lg">
            {PYTHON_PROJECT_FILES.map((file) => {
              const isSelected = activeFile.path === file.path;
              return (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => setActiveFile(file)}
                  className={`w-full text-left p-2.5 rounded-xl transition flex items-center justify-between text-xs font-medium cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 text-white border border-emerald-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {getFileIcon(file.name)}
                    <div className="truncate">
                      <div className="font-mono font-semibold text-slate-200 truncate">{file.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">{file.path}</div>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 ml-1"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Destaques Arquiteturais do Arquivo Selecionado */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3 shadow-lg">
            <div className="flex items-center gap-2 text-white font-semibold text-xs">
              <Info className="w-4 h-4 text-emerald-400" />
              <span>Explicação: {activeFile.name}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {activeFile.description}
            </p>

            <div className="space-y-2 pt-1 border-t border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Principais Componentes & Padrões:
              </div>
              {activeFile.highlights.map((h, i) => (
                <div key={i} className="text-xs bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 space-y-1">
                  <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    {h.title}
                  </div>
                  <div className="text-slate-400 text-[11px] leading-relaxed">
                    {h.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Painel Direito: Visualizador de Código */}
        <div className="lg:col-span-8 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
          {/* Barra Superior do Arquivo */}
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
              <span className="ml-2 font-mono text-xs text-slate-300 font-semibold">
                {activeFile.path}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition flex items-center gap-1.5 border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar Código'}</span>
              </button>

              <button
                type="button"
                onClick={() => downloadSingleFile(activeFile.name, activeFile.content)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition flex items-center gap-1.5 border border-slate-700"
                title="Baixar somente este arquivo"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Baixar Arquivo</span>
              </button>
            </div>
          </div>

          {/* Área com Linhas de Código */}
          <div className="p-4 font-mono text-xs overflow-x-auto max-h-[620px] overflow-y-auto bg-slate-950 text-slate-200 leading-relaxed select-text">
            <pre className="grid grid-cols-[auto_1fr] gap-x-4">
              {activeFile.content.split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  <span className="text-slate-600 select-none text-right pr-2 border-r border-slate-800/80 text-[11px]">
                    {index + 1}
                  </span>
                  <span className="whitespace-pre">
                    {/* Syntax highlights simplificado em classes Tailwind para legibilidade */}
                    {line.startsWith('#') || line.startsWith('"""') || line.startsWith(' *') || line.startsWith('//') ? (
                      <span className="text-slate-500 italic">{line}</span>
                    ) : line.includes('def ') || line.includes('class ') ? (
                      <span className="text-emerald-400 font-semibold">{line}</span>
                    ) : line.includes('import ') || line.includes('from ') ? (
                      <span className="text-purple-400">{line}</span>
                    ) : line.includes('return ') || line.includes('if ') || line.includes('elif ') || line.includes('else:') ? (
                      <span className="text-amber-400">{line}</span>
                    ) : (
                      <span>{line}</span>
                    )}
                  </span>
                </React.Fragment>
              ))}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

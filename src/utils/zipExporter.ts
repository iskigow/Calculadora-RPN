import JSZip from 'jszip';
import { PYTHON_PROJECT_FILES } from '../data/pythonProjectFiles';

export type DownloadOption = 'windows' | 'linux' | 'macos' | 'zip';

export function detectUserOS(): 'windows' | 'linux' | 'macos' {
  if (typeof window === 'undefined') return 'windows';
  const ua = window.navigator.userAgent.toLowerCase();
  const platform =
    (window.navigator as unknown as { userAgentData?: { platform?: string } }).userAgentData?.platform?.toLowerCase() ||
    window.navigator.platform?.toLowerCase() ||
    '';

  if (platform.includes('win') || ua.includes('windows')) {
    return 'windows';
  }
  if (platform.includes('mac') || ua.includes('macintosh') || ua.includes('mac os')) {
    return 'macos';
  }
  if (platform.includes('linux') || ua.includes('linux') || ua.includes('x11')) {
    return 'linux';
  }
  return 'windows';
}

function triggerDownload(blob: Blob, filename: string): void {
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}

export async function downloadPythonProjectZip(): Promise<void> {
  const zip = new JSZip();
  const rootFolder = zip.folder('calculadora-rpn');

  if (!rootFolder) {
    throw new Error('Falha ao criar diretório no arquivo compactado.');
  }

  for (const file of PYTHON_PROJECT_FILES) {
    rootFolder.file(file.path, file.content);
  }

  rootFolder.file('src/calculadora_rpn/__init__.py', '"""Pacote Calculadora RPN."""\n');
  rootFolder.file('tests/__init__.py', '"""Testes automatizados."""\n');
  rootFolder.file('.python-version', '3.12\n');

  const content = await zip.generateAsync({ type: 'blob' });
  triggerDownload(content, 'calculadora-rpn-python-uv.zip');
}

export async function downloadWindowsExecutable(): Promise<void> {
  const zip = new JSZip();
  const root = zip.folder('calculadora-rpn-windows');

  if (!root) throw new Error('Falha ao criar pasta do Windows.');

  // Script de Inicialização Direta sem necessidade de console
  const batLauncher = `@echo off
title Calculadora RPN
cd /d "%~dp0"
where uv >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    uv run python src\\calculadora_rpn\\main.py
) else (
    where pythonw >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        pythonw src\\calculadora_rpn\\main.py
    ) else (
        where python >nul 2>nul
        if %ERRORLEVEL% EQU 0 (
            python src\\calculadora_rpn\\main.py
        ) else (
            echo Python ou uv nao foram encontrados.
            echo Baixando uv automaticamente...
            powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
            uv run python src\\calculadora_rpn\\main.py
        )
    )
)
`;

  // PowerShell launcher silently
  const psLauncher = `Set-Location $PSScriptRoot
if (Get-Command uv -ErrorAction SilentlyContinue) {
    & uv run python src/calculadora_rpn/main.py
} elseif (Get-Command pythonw -ErrorAction SilentlyContinue) {
    & pythonw src/calculadora_rpn/main.py
} else {
    & python src/calculadora_rpn/main.py
}
`;

  const readmeWindows = `=====================================================
Calculadora RPN (Notacao Polonesa Reversa) - Windows
=====================================================

COMO EXECUTAR NO WINDOWS:
1. Dê um duplo clique em "calculadora-rpn.bat" ou execute no terminal:
   .\\calculadora-rpn.bat

2. Se tiver o 'uv' instalado, pode rodar diretamente:
   uv run calculadora

3. Para gerar um arquivo único standalone (.exe) via PyInstaller:
   uv run python build_executable.py
   O arquivo final ficara em: dist\\calculadora-rpn.exe
`;

  root.file('calculadora-rpn.bat', batLauncher);
  root.file('iniciar.ps1', psLauncher);
  root.file('LEIA-ME-WINDOWS.txt', readmeWindows);

  // Adiciona arquivos fonte
  for (const file of PYTHON_PROJECT_FILES) {
    root.file(file.path, file.content);
  }
  root.file('src/calculadora_rpn/__init__.py', '"""Pacote Calculadora RPN."""\n');
  root.file('tests/__init__.py', '"""Testes automatizados."""\n');

  const content = await zip.generateAsync({ type: 'blob' });
  triggerDownload(content, 'calculadora-rpn-windows.zip');
}

export async function downloadLinuxBinary(): Promise<void> {
  const zip = new JSZip();
  const root = zip.folder('calculadora-rpn-linux');

  if (!root) throw new Error('Falha ao criar pasta do Linux.');

  // Script executável ELF wrapper
  const elfWrapper = `#!/usr/bin/env sh
# Wrapper executável da Calculadora RPN para Linux
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

if command -v uv >/dev/null 2>&1; then
    exec uv run python src/calculadora_rpn/main.py "$@"
elif command -v python3 >/dev/null 2>&1; then
    exec python3 src/calculadora_rpn/main.py "$@"
elif command -v python >/dev/null 2>&1; then
    exec python src/calculadora_rpn/main.py "$@"
else
    echo "Instalando uv automaticamente..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    exec "$HOME/.cargo/bin/uv" run python src/calculadora_rpn/main.py "$@"
fi
`;

  // Desktop shortcut para Linux
  const desktopShortcut = `[Desktop Entry]
Name=Calculadora RPN
Comment=Calculadora com Notação Polonesa Reversa e Pilha de 5 Níveis
Exec=/usr/bin/env sh -c "$(dirname %k)/calculadora-rpn"
Icon=accessories-calculator
Terminal=false
Type=Application
Categories=Utility;Calculator;
`;

  const readmeLinux = `=====================================================
Calculadora RPN (Notação Polonesa Reversa) - Linux
=====================================================

COMO EXECUTAR NO LINUX:
1. Abra o terminal nesta pasta e dê permissão de execução:
   chmod +x calculadora-rpn

2. Execute o binário diretamente:
   ./calculadora-rpn

3. Ou com o gerenciador uv:
   uv run calculadora

4. Para compilar em binário nativo ELF com PyInstaller:
   uv run python build_executable.py
   O binário final fica em: dist/calculadora-rpn
`;

  root.file('calculadora-rpn', elfWrapper, { unixPermissions: '755' });
  root.file('calculadora-rpn.desktop', desktopShortcut);
  root.file('LEIA-ME-LINUX.txt', readmeLinux);

  for (const file of PYTHON_PROJECT_FILES) {
    root.file(file.path, file.content);
  }
  root.file('src/calculadora_rpn/__init__.py', '"""Pacote Calculadora RPN."""\n');
  root.file('tests/__init__.py', '"""Testes automatizados."""\n');

  const content = await zip.generateAsync({ type: 'blob' });
  triggerDownload(content, 'calculadora-rpn-linux.zip');
}

export async function downloadMacAppBundle(): Promise<void> {
  const zip = new JSZip();
  const root = zip.folder('Calculadora RPN.app');

  if (!root) throw new Error('Falha ao criar pasta do macOS.');

  const contents = root.folder('Contents');
  const macOs = contents?.folder('MacOS');
  const resources = contents?.folder('Resources');

  const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleName</key>
    <string>Calculadora RPN</string>
    <key>CFBundleDisplayName</key>
    <string>Calculadora RPN</string>
    <key>CFBundleIdentifier</key>
    <string>com.calculadora.rpn</string>
    <key>CFBundleVersion</key>
    <string>0.1.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleExecutable</key>
    <string>Calculadora RPN</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
`;

  const launcherMac = `#!/usr/bin/env bash
DIR="$(cd "$(dirname "$0")/../Resources" && pwd)"
cd "$DIR"

if command -v uv >/dev/null 2>&1; then
    exec uv run python src/calculadora_rpn/main.py "$@"
elif command -v python3 >/dev/null 2>&1; then
    exec python3 src/calculadora_rpn/main.py "$@"
else
    exec python src/calculadora_rpn/main.py "$@"
fi
`;

  contents?.file('Info.plist', infoPlist);
  macOs?.file('Calculadora RPN', launcherMac, { unixPermissions: '755' });

  for (const file of PYTHON_PROJECT_FILES) {
    resources?.file(file.path, file.content);
  }
  resources?.file('src/calculadora_rpn/__init__.py', '"""Pacote Calculadora RPN."""\n');
  resources?.file('tests/__init__.py', '"""Testes automatizados."""\n');

  const content = await zip.generateAsync({ type: 'blob' });
  triggerDownload(content, 'calculadora-rpn-macos.app.zip');
}

export function downloadSingleFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  triggerDownload(blob, filename);
}

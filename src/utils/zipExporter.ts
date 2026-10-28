import JSZip from 'jszip';
import { PYTHON_PROJECT_FILES } from '../data/pythonProjectFiles';

export async function downloadPythonProjectZip(): Promise<void> {
  const zip = new JSZip();
  const rootFolder = zip.folder('calculadora-rpn');

  if (!rootFolder) {
    throw new Error('Falha ao criar diretório no arquivo compactado.');
  }

  // Adiciona cada arquivo no caminho correspondente
  for (const file of PYTHON_PROJECT_FILES) {
    rootFolder.file(file.path, file.content);
  }

  // Adiciona __init__.py vazio para o pacote raiz e testes
  rootFolder.file('src/calculadora_rpn/__init__.py', '"""Pacote Calculadora RPN."""\n');
  rootFolder.file('tests/__init__.py', '"""Testes automatizados."""\n');
  rootFolder.file('.python-version', '3.12\n');

  const content = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(content);

  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = 'calculadora-rpn-python-uv.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}

export function downloadSingleFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

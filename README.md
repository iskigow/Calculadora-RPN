# Calculadora RPN — Demo Web (TypeScript) & Projeto Python

Este repositório contém duas partes complementares:
1. **Demo Web Interativo (TypeScript + React + Vite)**: Um estúdio visual completo que roda no navegador, com o simulador da calculadora RPN com pilha de 5 níveis, tutorial interativo, visualizador de código e gerador de downloads com detecção de sistema operacional.
2. **Projeto Python Puro (`/python_project/`)**: A aplicação desktop nativa desenvolvida em Python com interface gráfica **Tkinter**, feedback sonoro e gerenciamento moderno de dependências via **uv**.

---

## 🚀 Como Iniciar o Demo Web (TypeScript)

Para rodar o demo web interativo localmente no seu computador:

### Pré-requisitos
- **Node.js** (versão 18 ou superior recomendada): [nodejs.org](https://nodejs.org/)
- **npm** (incluso com o Node.js) ou gerenciador compatível (`pnpm`, `yarn`, `bun`)

### Passo a Passo

1. **Clone ou abra a pasta raiz do projeto**:
   ```bash
   cd caminho/para/o/projeto
   ```

2. **Instale as dependências do Node.js**:
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

4. **Acesse no navegador**:
   O Vite iniciará o servidor local. Abra o endereço no navegador:
   ```text
   http://localhost:3000
   ```
   *(Caso a porta 3000 esteja ocupada, o Vite indicará a porta alternativa no terminal, ex: `http://localhost:3001`)*.

---

## 📜 Scripts Disponíveis no Demo Web

No diretório raiz (`package.json`), você pode executar:

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento Vite na porta 3000 com live preview |
| `npm run build` | Compila o projeto TypeScript e React para produção na pasta `dist/` |
| `npm run preview` | Pré-visualiza localmente a versão compilada de produção |
| `npm run lint` | Executa a verificação estática de tipos com o compilador TypeScript (`tsc --noEmit`) |
| `npm run clean` | Limpa as pastas de compilação `dist/` |

---

## 🗂️ Estrutura do Repositório

```text
├── index.html                 # Ponto de entrada HTML da aplicação web
├── package.json               # Dependências do demo web (React, Vite, Tailwind, Lucide)
├── tsconfig.json              # Configurações do compilador TypeScript
├── vite.config.ts             # Configuração do Vite e plugins React/Tailwind
├── src/                       # Código-fonte do Demo Web em TypeScript
│   ├── App.tsx                # Interface principal com navegação por abas e seletor de download
│   ├── components/            # Componentes React
│   │   ├── RPNCalculatorSimulator.tsx  # Simulador interativo da calculadora com pilha de 5 níveis
│   │   ├── ProjectCodeViewer.tsx       # Visualizador com cópia e download de arquivos
│   │   ├── RPNTutorial.tsx             # Guia didático passo a passo sobre Notação Polonesa
│   │   ├── UvGuide.tsx                 # Guia de comandos do gestor uv (Astral)
│   │   └── ExecutableGeneratorGuide.tsx# Guia e gerador de executáveis para Win/Mac/Linux
│   ├── utils/
│   │   ├── audio.ts           # Síntese sonora tátil via Web Audio API
│   │   └── zipExporter.ts     # Gerador de downloads (.zip, executáveis, detecção de SO)
│   └── data/
│       └── pythonProjectFiles.ts # Arquivos do projeto Python embutidos para visualização e zip
│
└── python_project/            # PROJETO PYTHON NATIVO (Tkinter + uv)
    ├── pyproject.toml         # Manifesto do projeto Python gerenciado pelo uv
    ├── README.md              # Documentação completa exclusiva do projeto Python
    ├── build_executable.py    # Script para gerar executáveis nativos (.exe, ELF, .app)
    ├── src/
    │   └── calculadora_rpn/
    │       ├── __init__.py
    │       ├── stack.py       # Motor puro da pilha de 5 níveis
    │       ├── gui.py         # Interface desktop Tkinter com som nativo
    │       └── main.py        # Ponto de entrada Python
    └── tests/
        └── test_stack.py      # Suíte de testes automatizados com pytest
```

---

## 🐍 Como Iniciar o Projeto Python (Desktop)

Se preferir rodar diretamente a aplicação desktop em Python:

1. **Instale o `uv`** (se ainda não tiver):
   - Windows (PowerShell): `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"`
   - Linux/macOS: `curl -LsSf https://astral.sh/uv/install.sh | sh`

2. **Entre na pasta `python_project/` e execute**:
   ```bash
   cd python_project
   uv run calculadora
   ```

3. **Para rodar os testes unitários**:
   ```bash
   uv run pytest
   ```

4. **Para gerar o executável nativo (.exe / ELF / .app)**:
   ```bash
   uv run python build_executable.py
   ```

---

## 📄 Licença
Código aberto sob a licença MIT / Apache 2.0.

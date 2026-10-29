# Calculadora RPN em Python com Pilha de 5 Níveis

Calculadora em Python que utiliza **Notação Polonesa Reversa (RPN)** com **pilha de 5 níveis**, capaz de realizar as **4 operações aritméticas básicas** (+, −, ×, ÷), interface gráfica organizada via **Tkinter** (nativa do Python) e gerenciada pelo **uv** (o gestor moderno de pacotes e ambientes da Astral).

---

## 📑 Sumário

1. [Simulador Interativo](#1-simulador-interativo)
2. [Estrutura do Código & Arquitetura](#2-estrutura-do-código--arquitetura)
3. [O que é RPN? (Notação Polonesa Reversa)](#3-o-que-é-rpn-notação-polonesa-reversa)
4. [Guia Completo do uv](#4-guia-completo-do-uv)
5. [Gerar Executáveis Nativos (Windows, Linux, macOS)](#5-gerar-executáveis-nativos-windows-linux-macos)

---

## 1. Simulador Interativo

A aplicação conta com uma interface gráfica para desktop desenvolvida em **Tkinter**, replicando fielmente a experiência de calculadoras científicas clássicas como a **HP-48G** e **HP-12C**.

### Visor dos 5 Níveis
O display exibe os 5 níveis da pilha simultaneamente de cima para baixo:

```text
┌──────────────────────────────────────────────┐
│ Nível 5 (U)                             0.0  │  <- Limite superior / overflow
│ Nível 4 (T)                             0.0  │  <- Armazenamento intermediário
│ Nível 3 (Z)                             0.0  │  <- Armazenamento intermediário
│ Nível 2 (Y)                             0.0  │  <- Base / 1º operando
│ Nível 1 (X)                             0.0  │  <- Registro ativo / Entrada
└──────────────────────────────────────────────┘
```

### Controles & Teclas Principais
- **ENTER ↵**: Confirma o valor digitado no Nível 1 e o empurra para o Nível 2. Todos os níveis existentes sobem uma posição.
- **+ , − , × , ÷**: Executam a operação aritmética entre o **Nível 2** (primeiro operando) e o **Nível 1** (segundo operando). O resultado substitui o Nível 1 e a pilha desce.
- **% (Porcentagem)**: Convenção clássica HP RPN: calcula a porcentagem do Nível 2 (Y) usando a taxa do Nível 1 (X) (`(Y * X) / 100`). O valor base em Nível 2 permanece preservado, permitindo pressionar imediatamente `+` para acréscimo/taxa (ex: `200 ENTER 15 % + = 230`) ou `−` para desconto (ex: `200 ENTER 15 % − = 170`).
- **SWAP (X⇄Y)**: Inverte os valores entre o Nível 1 e o Nível 2.
- **DROP**: Descarta o valor atual do Nível 1; os níveis superiores descem.
- **CLEAR**: Zera instantaneamente todos os 5 níveis da pilha.
- **±**: Inverte o sinal (+ / -) do número em digitação ou do Nível 1.

### Atalhos de Teclado Físico
Você pode utilizar o seu teclado numérico normal:
- **0 a 9** e **.** : Digitação de números e decimais
- **Enter** ou **NumPad Enter**: Tecla ENTER da pilha
- **+**, **-**, **\***, **/** : Operações aritméticas imediatas
- **%** : Operação de porcentagem
- **Backspace**: Apagar último dígito digitado
- **Escape (Esc)**: Limpar a pilha (CLEAR)

---

## 2. Estrutura do Código & Arquitetura

O projeto foi construído seguindo o padrão **MVC (Model-View-Controller)**, garantindo que o motor matemático da pilha funcione de forma 100% independente da interface gráfica.

### Árvore de Arquivos

```text
python_project/
├── pyproject.toml                 # Configuração do projeto e dependências com o uv
├── README.md                      # Esta documentação completa
├── build_executable.py            # Script multiplataforma para gerar executáveis nativos
├── .github/
│   └── workflows/
│       └── build-executables.yml  # Compilação automática na nuvem com GitHub Actions
├── src/
│   └── calculadora_rpn/
│       ├── __init__.py            # Marca o diretório como pacote Python
│       ├── stack.py               # [MODEL] Motor puro da pilha de 5 níveis
│       ├── gui.py                 # [VIEW] Interface gráfica em Tkinter
│       └── main.py                # [ENTRYPOINT] Ponto de entrada executável
└── tests/
    ├── __init__.py
    └── test_stack.py              # Suíte de testes unitários com pytest
```

### Principais Módulos:

1. **`src/calculadora_rpn/stack.py` (Motor da Pilha)**:
   - Mantém uma lista estrita de tamanho 5: `self._levels = [0.0] * 5`.
   - Implementa o comportamento **LIFO** (Last-In, First-Out).
   - Realiza cálculo seguro com tratamento de `ZeroDivisionError` (divisão por zero tratada com exceção amigável).
   - Suporta funções de manipulação de pilha: `push`, `pop`, `enter`, `swap_xy`, `drop`, `clear` e `roll_down`.

2. **`src/calculadora_rpn/gui.py` (Interface Gráfica Tkinter)**:
   - Utiliza exclusivamente `tkinter`, que já vem instalado com o Python em todos os sistemas operacionais.
   - Não requer bibliotecas pesadas de terceiros (como Qt ou wxWidgets).
   - Barra de status com mensagens claras de sucesso e aviso.
   - Vinculação de eventos de teclado com `root.bind(...)`.

3. **`tests/test_stack.py` (Testes com Pytest)**:
   - Testa soma, subtração, multiplicação e divisão.
   - Testa o limite e descarte ao ultrapassar o 5º nível.
   - Testa a proteção contra divisão por zero (`pytest.raises(ZeroDivisionError)`).

---

## 3. O que é RPN? (Notação Polonesa Reversa)

A **Notação Polonesa Reversa** (conhecida internacionalmente como **RPN** ou *Postfix Notation*) foi inventada pelo matemático e lógico polonês **Jan Łukasiewicz** em 1924, e adaptada para computação pelo cientista Charles Hamblin na década de 1950.

Tornou-se mundialmente famosa após ser adotada pela **Hewlett-Packard (HP)** em suas icônicas calculadoras científicas e financeiras (HP-35, HP-12C, HP-48G).

### Por que a RPN é Superior?

Na notação tradicional (Infixa), o operador fica no meio dos operandos: `5 + 3`.
Na RPN (Posfixa), os operandos entram primeiro e o operador vem depois: `5 3 +`.

| Notação Algébrica Tradicional (Infixa) | Notação Polonesa Reversa (RPN / Posfixa) |
| :--- | :--- |
| Exige parênteses para forçar precedência | **Zero parênteses necessários** |
| O cálculo só acontece ao pressionar `=` | **Cálculo imediato** a cada operador |
| Mais toques de tecla (em média 30% a mais) | **Fluxo mais rápido e eficiente** |
| Erros fáceis ao esquecer de fechar `)` | **Sem ambiguidades sintáticas** |

### Exemplo Prático 1: Somar `(15 + 25) × 3`

1. Digite `15` e pressione **ENTER** (o 15 sobe para o Nível 2).
2. Digite `25` e pressione **+** (o resultado intermediário `40` surge imediatamente no Nível 1).
3. Pressione **ENTER** (o 40 sobe para o Nível 2).
4. Digite `3` e pressione **×** (o resultado final `120` aparece no visor).

### Exemplo Prático 2: Expressão complexa `(10 + 20) / (8 - 3)`

- **Na calculadora tradicional**: `(` `1` `0` `+` `2` `0` `)` `÷` `(` `8` `−` `3` `)` `=` (12 toques de tecla)
- **Na RPN**:
  1. `10 [ENTER] 20 [+]` ➔ Gera `30`
  2. `[ENTER]` ➔ Guarda o `30` no Nível 2
  3. `8 [ENTER] 3 [−]` ➔ Gera `5` (o `30` continua preservado no Nível 2)
  4. `[÷]` ➔ Divide `30 / 5` e exibe o resultado final `6.0`! (Apenas 8 toques)

---

## 4. Guia Completo do uv

O **[uv](https://github.com/astral-sh/uv)** é a ferramenta de empacotamento e gestão de ambientes Python de última geração, desenvolvida em **Rust** pela equipe da Astral.

Ele substitui com vantagens extremas as ferramentas antigas:
- Substitui o `pip` (sendo de 10 a 100 vezes mais rápido).
- Substitui o `virtualenv` e o comando `python -m venv` (gerenciamento automático de `.venv`).
- Substitui ferramentas complexas como `poetry` e `pip-tools`.

### 1. Como Instalar o uv

- **Linux e macOS:**
  ```bash
  curl -LsSf https://astral.sh/uv/install.sh | sh
  ```

- **Windows (PowerShell):**
  ```powershell
  powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
  ```

- **Alternativa via Pip ou Homebrew:**
  ```bash
  pip install uv
  # ou no macOS:
  brew install uv
  ```

### 2. Comandos do Dia a Dia

| O que você quer fazer | Comando com o uv |
| :--- | :--- |
| **Iniciar a Calculadora** | `uv run calculadora` |
| **Rodar os Testes Automatizados** | `uv run pytest` |
| **Gerar o Executável Nativo** | `uv run python build_executable.py` |
| **Adicionar uma nova biblioteca** | `uv add nome_do_pacote` |
| **Adicionar dependência de dev** | `uv add --dev pytest` |
| **Criar/recriar ambiente virtual** | `uv venv` |
| **Visualizar árvore de pacotes** | `uv tree` |

> ✨ **A grande vantagem do `uv run`:** Você **não precisa ativar manualmente** o ambiente virtual (`source .venv/bin/activate` ou `.venv\Scripts\activate`). O `uv run` detecta o ambiente, sincroniza as dependências em milissegundos e roda o script diretamente!

---

## 5. Gerar Executáveis Nativos (Windows, Linux, macOS)

Você pode transformar esta calculadora em um **arquivo executável único e portátil**, que pode ser compartilhado com qualquer pessoa sem que ela precise ter Python instalado.

O empacotamento reúne em um único arquivo:
- O interpretador Python otimizado.
- As bibliotecas nativas do Tkinter e Tcl.
- O código-fonte da aplicação.

### Método 1: Script Automático Multiplataforma (Recomendado)

Criamos o arquivo `build_executable.py`, que detecta em qual sistema você está e compila com as opções ideais:

```bash
uv run python build_executable.py
```

- **No Windows**: Cria `dist/calculadora-rpn.exe` (portátil, com o terminal preto ocultado via `--noconsole`).
- **No Linux**: Cria `dist/calculadora-rpn` (binário nativo ELF compatível com Ubuntu, Debian, Fedora, Arch, etc.).
- **No macOS**: Cria `dist/Calculadora RPN.app` (pacote `.app` pronto para execução com duplo clique no Finder).

### Método 2: Comandos Diretos com o PyInstaller

Se preferir rodar o comando manual:

- **Windows:**
  ```powershell
  uv run pyinstaller --onefile --noconsole --name "calculadora-rpn" src/calculadora_rpn/main.py
  ```

- **Linux:**
  ```bash
  uv run pyinstaller --onefile --windowed --name "calculadora-rpn" src/calculadora_rpn/main.py
  ```

- **macOS:**
  ```bash
  uv run pyinstaller --onefile --windowed --name "Calculadora RPN" --osx-bundle-identifier com.calculadora.rpn src/calculadora_rpn/main.py
  ```

### Método 3: Compilação Automática na Nuvem (GitHub Actions)

O projeto inclui o fluxo de CI/CD `.github/workflows/build-executables.yml`.

Quando você envia o código para um repositório no GitHub:
1. O GitHub inicia 3 máquinas virtuais paralelas: **Windows**, **Ubuntu Linux** e **macOS**.
2. Cada máquina compila o executável nativo do respectivo sistema operacional.
3. Os 3 arquivos prontos para distribuição ficam disponíveis para download direto na aba **Actions** ou **Releases** do seu repositório.

---

## 📄 Licença
Este projeto é de código aberto e está sob a licença MIT / Apache 2.0. Sinta-se livre para usar, estudar e modificar!

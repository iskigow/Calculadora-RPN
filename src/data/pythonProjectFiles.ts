export interface ProjectFile {
  name: string;
  path: string;
  language: string;
  description: string;
  content: string;
  highlights: { title: string; explanation: string }[];
}

export const PYTHON_PROJECT_FILES: ProjectFile[] = [
  {
    name: "stack.py",
    path: "src/calculadora_rpn/stack.py",
    language: "python",
    description: "Motor central da calculadora RPN com pilha rigorosa de 5 níveis e operações aritméticas.",
    highlights: [
      {
        title: "Pilha de 5 Níveis (L1 a L5)",
        explanation: "Mantém uma lista de 5 posições de ponto flutuante. O Nível 1 representa o registro ativo (X) e o Nível 2 o operando secundário (Y)."
      },
      {
        title: "Execução das 4 Operações",
        explanation: "Nas operações binárias (+, -, *, /), o Nível 2 opera sobre o Nível 1 (ex: Y - X e Y / X). A pilha desce automaticamente após o cálculo."
      },
      {
        title: "Tratamento de Divisão por Zero",
        explanation: "Lança exceção amigável ZeroDivisionError caso o divisor (Nível 1) seja zero, impedindo travamentos na interface."
      },
      {
        title: "Funções Utilitárias RPN",
        explanation: "Implementa ENTER (duplicar/empilhar), SWAP (trocar L1 e L2), DROP (descartar L1) e CLEAR (limpar os 5 níveis)."
      }
    ],
    content: `"""
Módulo do motor de pilha da Calculadora em Notação Polonesa Reversa (RPN).
Implementa uma pilha com capacidade de exatamente 5 níveis (Nível 1 a Nível 5).
"""

from typing import List


class RPNStack:
    """
    Gerencia a pilha RPN de 5 níveis.

    Convenção clássica de calculadoras RPN (HP):
    - Nível 1 (X): Registro ativo / topo da pilha (usado na entrada).
    - Nível 2 (Y): Segundo operando para operações aritméticas.
    - Nível 3 (Z): Terceiro operando.
    - Nível 4 (T): Quarto operando.
    - Nível 5 (U): Quinto operando (topo do limite).
    """

    MAX_LEVELS = 5

    def __init__(self) -> None:
        # A pilha armazena 5 números decimais (float), inicializados com 0.0
        # O índice 0 corresponde ao Nível 1 (X)
        self._levels: List[float] = [0.0] * self.MAX_LEVELS

    @property
    def levels(self) -> List[float]:
        """Retorna uma cópia dos 5 níveis da pilha [Nível 1, ..., Nível 5]."""
        return list(self._levels)

    def get_level(self, level: int) -> float:
        """
        Retorna o valor no nível especificado (1 a 5).
        Nível 1 = índice 0, Nível 5 = índice 4.
        """
        if not 1 <= level <= self.MAX_LEVELS:
            raise ValueError(f"O nível deve estar entre 1 e {self.MAX_LEVELS}.")
        return self._levels[level - 1]

    def push(self, value: float) -> None:
        """
        Empurra um novo valor para o Nível 1.
        Todos os níveis anteriores sobem uma posição (L1 -> L2, L2 -> L3, etc.).
        O valor anterior no Nível 5 é descartado (overflow natural da pilha).
        """
        self._levels = [float(value)] + self._levels[: self.MAX_LEVELS - 1]

    def set_level_1(self, value: float) -> None:
        """Atualiza diretamente o Nível 1 (usado enquanto o usuário digita)."""
        self._levels[0] = float(value)

    def pop(self) -> float:
        """
        Remove e retorna o valor do Nível 1.
        Os níveis superiores descem uma posição (L2 -> L1, L3 -> L2, etc.).
        O Nível 5 é preenchido com 0.0.
        """
        top_value = self._levels[0]
        self._levels = self._levels[1:] + [0.0]
        return top_value

    def execute_op(self, op: str) -> float:
        """
        Executa uma das 4 operações aritméticas básicas (+, -, *, /).
        
        Na RPN clássica:
        - Nível 2 (Y) é o primeiro operando.
        - Nível 1 (X) é o segundo operando.
        - Exemplo: 10 [ENTER] 2 [/] calcula (10 / 2) = 5.0.
        
        Após a operação, ambos os níveis originais saem e o resultado assume o Nível 1,
        fazendo a pilha descer.
        """
        val_x = self.get_level(1)  # Nível 1 (X)
        val_y = self.get_level(2)  # Nível 2 (Y)

        if op == "+":
            result = val_y + val_x
        elif op == "-":
            result = val_y - val_x
        elif op == "*":
            result = val_y * val_x
        elif op == "/":
            if val_x == 0:
                raise ZeroDivisionError("Divisão por zero não é permitida!")
            result = val_y / val_x
        else:
            raise ValueError(f"Operador desconhecido: '{op}'")

        # A pilha desce: L1 sai, L2 é substituído pelo resultado, e L5 recebe 0.0
        self._levels = [result] + self._levels[2:] + [0.0]
        return result

    def enter(self) -> None:
        """
        Tecla ENTER: duplica o valor do Nível 1 para o Nível 2,
        deslocando toda a pilha para cima.
        """
        self.push(self._levels[0])

    def swap_xy(self) -> None:
        """Inverte os valores entre o Nível 1 (X) e o Nível 2 (Y)."""
        self._levels[0], self._levels[1] = self._levels[1], self._levels[0]

    def drop(self) -> None:
        """Descarta o valor do Nível 1 e faz os níveis superiores descerem."""
        self.pop()

    def clear(self) -> None:
        """Limpa todos os 5 níveis da pilha, redefinindo-os para 0.0."""
        self._levels = [0.0] * self.MAX_LEVELS

    def roll_down(self) -> None:
        """Gira a pilha para baixo ciclicamente (L1 vai para L5, L2 vai para L1)."""
        self._levels = self._levels[1:] + [self._levels[0]]
`
  },
  {
    name: "gui.py",
    path: "src/calculadora_rpn/gui.py",
    language: "python",
    description: "Interface gráfica moderna e simples construída com tkinter (nativo do Python, sem dependências extras).",
    highlights: [
      {
        title: "Display Visual dos 5 Níveis",
        explanation: "Mostra claramente os níveis 5 a 1 com identificadores visuais (L5 a L1/X), permitindo ao usuário acompanhar o fluxo de dados em tempo real."
      },
      {
        title: "Separação Model-View (MVC)",
        explanation: "A classe RPNCalculatorGUI recebe uma instância de RPNStack, mantendo a interface desacoplada das regras de cálculo."
      },
      {
        title: "Atalhos de Teclado",
        explanation: "Suporta teclado numérico físico, teclas Enter, +, -, *, /, Backspace e Escape para produtividade total."
      },
      {
        title: "Tratamento Visual de Erros",
        explanation: "Mensagens claras de aviso na barra de status em caso de divisão por zero ou entrada inválida."
      }
    ],
    content: `"""
Interface Gráfica (GUI) para a Calculadora RPN de 5 Níveis usando tkinter.
Desenvolvida com foco em simplicidade, elegância e facilidade de manutenção.
"""

import tkinter as tk
from tkinter import ttk
from typing import Optional
from calculadora_rpn.stack import RPNStack


class RPNCalculatorGUI:
    """Interface gráfica simples e organizada para calculadora RPN."""

    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.root.title("Calculadora RPN (5 Níveis)")
        self.root.geometry("380x620")
        self.root.resizable(False, False)

        # Configura tema e cores modernas
        self.bg_color = "#1e1e2e"
        self.card_color = "#2a2b3d"
        self.text_color = "#cdd6f4"
        self.accent_color = "#89b4fa"
        self.danger_color = "#f38ba8"
        self.success_color = "#a6e3a1"

        self.root.configure(bg=self.bg_color)

        # Instância do motor de pilha RPN
        self.stack = RPNStack()

        # Controle de estado de entrada do usuário
        self.is_entering_number = False
        self.current_entry = ""

        # Montagem dos componentes visuais
        self._setup_styles()
        self._build_header()
        self._build_stack_display()
        self._build_status_bar()
        self._build_keypad()
        self._bind_keyboard()

        # Atualiza o display inicial
        self._refresh_display()

    def _setup_styles(self) -> None:
        """Configura estilos ttk para botões e caixas."""
        style = ttk.Style()
        style.theme_use("clam")

    def _build_header(self) -> None:
        """Cabeçalho simples com título e descrição do modo RPN."""
        header_frame = tk.Frame(self.root, bg=self.bg_color)
        header_frame.pack(fill=tk.X, padx=16, pady=(12, 6))

        title = tk.Label(
            header_frame,
            text="Calculadora RPN",
            font=("Helvetica", 14, "bold"),
            fg=self.text_color,
            bg=self.bg_color,
        )
        title.pack(anchor="w")

        subtitle = tk.Label(
            header_frame,
            text="Notação Polonesa Reversa • Pilha de 5 Níveis",
            font=("Helvetica", 9),
            fg="#a6adc8",
            bg=self.bg_color,
        )
        subtitle.pack(anchor="w")

    def _build_stack_display(self) -> None:
        """Área que exibe os 5 níveis da pilha (Nível 5 até Nível 1)."""
        display_frame = tk.Frame(
            self.root,
            bg=self.card_color,
            bd=1,
            relief=tk.SOLID,
            highlightbackground="#45475a",
            highlightthickness=1,
        )
        display_frame.pack(fill=tk.X, padx=16, pady=6)

        self.level_labels = {}

        # Criamos as linhas do nível 5 ao nível 1
        level_names = [
            (5, "Nível 5 (U)"),
            (4, "Nível 4 (T)"),
            (3, "Nível 3 (Z)"),
            (2, "Nível 2 (Y)"),
            (1, "Nível 1 (X)"),
        ]

        for level_num, level_title in level_names:
            row = tk.Frame(display_frame, bg=self.card_color)
            row.pack(fill=tk.X, padx=10, pady=2)

            is_active = level_num == 1
            fg_title = self.accent_color if is_active else "#9399b2"
            font_title = ("Courier", 10, "bold" if is_active else "normal")

            lbl_title = tk.Label(
                row,
                text=level_title,
                font=font_title,
                fg=fg_title,
                bg=self.card_color,
                width=12,
                anchor="w",
            )
            lbl_title.pack(side=tk.LEFT)

            font_val = ("Courier", 12 if is_active else 11, "bold" if is_active else "normal")
            fg_val = self.text_color if not is_active else "#f5e0dc"

            lbl_val = tk.Label(
                row,
                text="0.0",
                font=font_val,
                fg=fg_val,
                bg=self.card_color,
                anchor="e",
            )
            lbl_val.pack(side=tk.RIGHT, fill=tk.X, expand=True)

            self.level_labels[level_num] = lbl_val

    def _build_status_bar(self) -> None:
        """Barra de status para exibir mensagens e avisos."""
        self.status_var = tk.StringVar(value="Pronto • Digite um número e pressione ENTER")
        self.status_label = tk.Label(
            self.root,
            textvariable=self.status_var,
            font=("Helvetica", 9),
            fg="#94e2d5",
            bg=self.bg_color,
            anchor="w",
        )
        self.status_label.pack(fill=tk.X, padx=20, pady=(2, 6))

    def _build_keypad(self) -> None:
        """Teclado com números, operações e utilitários RPN."""
        pad_frame = tk.Frame(self.root, bg=self.bg_color)
        pad_frame.pack(fill=tk.BOTH, expand=True, padx=16, pady=(0, 12))

        # Configura as 4 colunas de tamanho igual
        for col in range(4):
            pad_frame.columnconfigure(col, weight=1, uniform="pad_col")

        # Linha 0: Utilitários RPN
        btn_clear = self._create_button(pad_frame, "CLEAR", self._on_clear, "#f38ba8", "#11111b")
        btn_clear.grid(row=0, column=0, sticky="nsew", padx=3, pady=3)

        btn_drop = self._create_button(pad_frame, "DROP", self._on_drop, "#fab387", "#11111b")
        btn_drop.grid(row=0, column=1, sticky="nsew", padx=3, pady=3)

        btn_swap = self._create_button(pad_frame, "SWAP", self._on_swap, "#cba6f7", "#11111b")
        btn_swap.grid(row=0, column=2, sticky="nsew", padx=3, pady=3)

        btn_div = self._create_button(pad_frame, "÷", lambda: self._on_operator("/"), "#89b4fa", "#11111b")
        btn_div.grid(row=0, column=3, sticky="nsew", padx=3, pady=3)

        # Linha 1: 7, 8, 9, *
        self._create_num_button(pad_frame, "7", 1, 0)
        self._create_num_button(pad_frame, "8", 1, 1)
        self._create_num_button(pad_frame, "9", 1, 2)
        btn_mul = self._create_button(pad_frame, "×", lambda: self._on_operator("*"), "#89b4fa", "#11111b")
        btn_mul.grid(row=1, column=3, sticky="nsew", padx=3, pady=3)

        # Linha 2: 4, 5, 6, -
        self._create_num_button(pad_frame, "4", 2, 0)
        self._create_num_button(pad_frame, "5", 2, 1)
        self._create_num_button(pad_frame, "6", 2, 2)
        btn_sub = self._create_button(pad_frame, "−", lambda: self._on_operator("-"), "#89b4fa", "#11111b")
        btn_sub.grid(row=2, column=3, sticky="nsew", padx=3, pady=3)

        # Linha 3: 1, 2, 3, +
        self._create_num_button(pad_frame, "1", 3, 0)
        self._create_num_button(pad_frame, "2", 3, 1)
        self._create_num_button(pad_frame, "3", 3, 2)
        btn_add = self._create_button(pad_frame, "+", lambda: self._on_operator("+"), "#89b4fa", "#11111b")
        btn_add.grid(row=3, column=3, sticky="nsew", padx=3, pady=3)

        # Linha 4: +/-, 0, ., ENTER
        btn_sign = self._create_button(pad_frame, "±", self._on_toggle_sign, "#45475a", self.text_color)
        btn_sign.grid(row=4, column=0, sticky="nsew", padx=3, pady=3)

        self._create_num_button(pad_frame, "0", 4, 1)

        btn_dot = self._create_button(pad_frame, ".", self._on_dot, "#45475a", self.text_color)
        btn_dot.grid(row=4, column=2, sticky="nsew", padx=3, pady=3)

        btn_enter = self._create_button(pad_frame, "ENTER ↵", self._on_enter, "#a6e3a1", "#11111b", bold=True)
        btn_enter.grid(row=4, column=3, sticky="nsew", padx=3, pady=3)

        # Configura proporção das linhas do teclado
        for row in range(5):
            pad_frame.rowconfigure(row, weight=1)

    def _create_button(
        self,
        parent: tk.Frame,
        text: str,
        command,
        bg: str,
        fg: str,
        bold: bool = False,
    ) -> tk.Button:
        """Cria um botão estilizado consistente."""
        font = ("Helvetica", 11, "bold" if bold else "normal")
        btn = tk.Button(
            parent,
            text=text,
            command=command,
            font=font,
            bg=bg,
            fg=fg,
            activebackground="#585b70",
            activeforeground="#ffffff",
            relief=tk.FLAT,
            bd=0,
            cursor="hand2",
        )
        return btn

    def _create_num_button(self, parent: tk.Frame, num_char: str, row: int, col: int) -> None:
        """Auxiliar para criar botões numéricos com aparência padronizada."""
        btn = self._create_button(
            parent,
            num_char,
            lambda: self._on_digit(num_char),
            bg="#313244",
            fg=self.text_color,
            bold=True,
        )
        btn.grid(row=row, column=col, sticky="nsew", padx=3, pady=3)

    def _bind_keyboard(self) -> None:
        """Vincula atalhos do teclado para digitação rápida."""
        for digit in "0123456789":
            self.root.bind(digit, lambda e, d=digit: self._on_digit(d))

        self.root.bind(".", lambda e: self._on_dot())
        self.root.bind("<Return>", lambda e: self._on_enter())
        self.root.bind("<KP_Enter>", lambda e: self._on_enter())
        self.root.bind("+", lambda e: self._on_operator("+"))
        self.root.bind("-", lambda e: self._on_operator("-"))
        self.root.bind("*", lambda e: self._on_operator("*"))
        self.root.bind("/", lambda e: self._on_operator("/"))
        self.root.bind("<BackSpace>", lambda e: self._on_backspace())
        self.root.bind("<Escape>", lambda e: self._on_clear())

    # --- Lógica de Eventos e Manipulação de Estado ---

    def _on_digit(self, digit: str) -> None:
        """Adiciona um dígito numérico ao buffer atual."""
        if not self.is_entering_number:
            self.current_entry = digit
            self.is_entering_number = True
        else:
            self.current_entry += digit

        val = float(self.current_entry)
        self.stack.set_level_1(val)
        self._refresh_display()
        self.status_var.set("Digitando valor para o Nível 1...")

    def _on_dot(self) -> None:
        """Insere ponto decimal se ainda não existir."""
        if not self.is_entering_number:
            self.current_entry = "0."
            self.is_entering_number = True
        elif "." not in self.current_entry:
            self.current_entry += "."

        val = float(self.current_entry) if self.current_entry != "." else 0.0
        self.stack.set_level_1(val)
        self._refresh_display()

    def _on_toggle_sign(self) -> None:
        """Inverte o sinal (+ / -) do valor no Nível 1."""
        if self.is_entering_number and self.current_entry:
            if self.current_entry.startswith("-"):
                self.current_entry = self.current_entry[1:]
            else:
                self.current_entry = "-" + self.current_entry
            val = float(self.current_entry)
            self.stack.set_level_1(val)
        else:
            current = self.stack.get_level(1)
            self.stack.set_level_1(-current)
        self._refresh_display()

    def _on_backspace(self) -> None:
        """Apaga o último dígito digitado."""
        if self.is_entering_number and len(self.current_entry) > 0:
            self.current_entry = self.current_entry[:-1]
            val = float(self.current_entry) if self.current_entry and self.current_entry != "-" else 0.0
            self.stack.set_level_1(val)
            self._refresh_display()

    def _on_enter(self) -> None:
        """Confirma a entrada do número e empilha (duplica L1 para L2)."""
        self.stack.enter()
        self.is_entering_number = False
        self.current_entry = ""
        self._refresh_display()
        self.status_var.set("ENTER: Valor empurrado para o Nível 2.")

    def _on_operator(self, op: str) -> None:
        """Executa uma das 4 operações aritméticas básicas."""
        self.is_entering_number = False
        self.current_entry = ""
        try:
            res = self.stack.execute_op(op)
            self._refresh_display()
            op_names = {"+": "Soma", "-": "Subtração", "*": "Multiplicação", "/": "Divisão"}
            self.status_var.set(f"{op_names.get(op, op)} realizada com sucesso!")
        except ZeroDivisionError as err:
            self.status_var.set(f"Aviso: {err}")
        except Exception as err:
            self.status_var.set(f"Erro: {err}")

    def _on_swap(self) -> None:
        """Troca o Nível 1 e o Nível 2."""
        self.is_entering_number = False
        self.current_entry = ""
        self.stack.swap_xy()
        self._refresh_display()
        self.status_var.set("SWAP: Nível 1 e Nível 2 trocados.")

    def _on_drop(self) -> None:
        """Descarta o Nível 1."""
        self.is_entering_number = False
        self.current_entry = ""
        self.stack.drop()
        self._refresh_display()
        self.status_var.set("DROP: Nível 1 descartado.")

    def _on_clear(self) -> None:
        """Limpa toda a pilha de 5 níveis."""
        self.is_entering_number = False
        self.current_entry = ""
        self.stack.clear()
        self._refresh_display()
        self.status_var.set("CLEAR: Pilha de 5 níveis reiniciada.")

    def _format_number(self, num: float) -> str:
        """Formata o número para evitar notação feia com muitos zeros."""
        if num == int(num):
            return str(int(num))
        # Limita a 6 casas decimais se necessário
        formatted = f"{num:.6f}".rstrip("0").rstrip(".")
        return formatted

    def _refresh_display(self) -> None:
        """Atualiza os textos das labels de cada um dos 5 níveis."""
        levels = self.stack.levels
        # levels[0] é o Nível 1, levels[4] é o Nível 5
        for i in range(1, 6):
            val = levels[i - 1]
            txt = self._format_number(val)
            self.level_labels[i].config(text=txt)
`
  },
  {
    name: "main.py",
    path: "src/calculadora_rpn/main.py",
    language: "python",
    description: "Ponto de entrada da aplicação que inicializa o loop principal do Tkinter.",
    highlights: [
      {
        title: "Ponto de Entrada (__main__)",
        explanation: "Padrão canônico do Python com função main(), permitindo execução direta ou via script registrado no pyproject.toml."
      },
      {
        title: "Compatibilidade Multiplataforma",
        explanation: "Funciona nativamente em Windows, Linux e macOS sem necessidade de instalar compiladores C++ ou bibliotecas pesadas."
      }
    ],
    content: `"""
Ponto de entrada executável para a Calculadora RPN em Python.
Inicia a janela gráfica Tkinter e conecta o motor de pilha de 5 níveis.
"""

import sys
import tkinter as tk
from calculadora_rpn.gui import RPNCalculatorGUI


def main() -> None:
    """Função principal invocada pelo comando 'uv run calculadora'."""
    root = tk.Tk()
    
    # Instancia a interface gráfica
    app = RPNCalculatorGUI(root)
    
    # Inicia o loop de eventos da interface
    root.mainloop()


if __name__ == "__main__":
    main()
`
  },
  {
    name: "pyproject.toml",
    path: "pyproject.toml",
    language: "toml",
    description: "Arquivo de manifesto e configuração do projeto gerido pelo uv (Astral).",
    highlights: [
      {
        title: "Gerenciado pelo uv",
        explanation: "Utiliza as especificações modernas da PEP 517/621. O uv lê este arquivo diretamente, gerencia o venv e instala pacotes com velocidade extrema escrita em Rust."
      },
      {
        title: "Script Executável Registrado",
        explanation: "Define [project.scripts] com calculadora = 'calculadora_rpn.main:main', permitindo rodar diretamente 'uv run calculadora'."
      },
      {
        title: "Zero Dependências Externas em Produção",
        explanation: "Como usa tkinter (biblioteca padrão do Python), as dependências de produção são vazias! pytest fica no grupo de desenvolvimento."
      }
    ],
    content: `[project]
name = "calculadora-rpn"
version = "0.1.0"
description = "Calculadora em Python com Notação Polonesa Reversa (RPN) de 5 níveis e interface gráfica"
readme = "README.md"
requires-python = ">=3.10"
dependencies = []

[project.scripts]
calculadora = "calculadora_rpn.main:main"

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[dependency-groups]
dev = [
    "pytest>=8.0.0",
    "pyinstaller>=6.5.0",
]
`
  },
  {
    name: "test_stack.py",
    path: "tests/test_stack.py",
    language: "python",
    description: "Suíte de testes automatizados com pytest validando as 4 operações e os 5 níveis.",
    highlights: [
      {
        title: "Teste das 4 Operações Básicas",
        explanation: "Garante a correção de soma (+), subtração (-), multiplicação (*) e divisão (/)."
      },
      {
        title: "Teste da Capacidade dos 5 Níveis",
        explanation: "Verifica se valores empilhados sobem de L1 até L5 e se valores além do 5º nível sofrem descarte correto."
      },
      {
        title: "Proteção contra Divisão por Zero",
        explanation: "Testa com pytest.raises(ZeroDivisionError) para assegurar que divisões por zero sejam tratadas com segurança."
      }
    ],
    content: `"""
Testes unitários para o motor de pilha RPN de 5 níveis.
Pode ser executado com o comando:
    uv run pytest
"""

import pytest
from calculadora_rpn.stack import RPNStack


def test_initial_state():
    """Verifica se a pilha inicia com exatamente 5 níveis zerados."""
    stack = RPNStack()
    assert len(stack.levels) == 5
    assert stack.levels == [0.0, 0.0, 0.0, 0.0, 0.0]


def test_push_and_shift_up_to_5_levels():
    """Testa o empilhamento sucessivo de valores nos 5 níveis."""
    stack = RPNStack()
    for val in [10, 20, 30, 40, 50]:
        stack.push(val)

    # O último valor empurrado (50) deve estar no Nível 1 (índice 0)
    assert stack.get_level(1) == 50.0
    assert stack.get_level(2) == 40.0
    assert stack.get_level(3) == 30.0
    assert stack.get_level(4) == 20.0
    assert stack.get_level(5) == 10.0

    # Inserindo um 6º valor (60): o 10 (nível 5 anterior) deve ser descartado
    stack.push(60)
    assert stack.get_level(1) == 60.0
    assert stack.get_level(5) == 20.0


def test_addition():
    """Testa a operação de soma: 15 [ENTER] 25 [+] = 40."""
    stack = RPNStack()
    stack.push(15)
    stack.push(25)
    result = stack.execute_op("+")
    assert result == 40.0
    assert stack.get_level(1) == 40.0


def test_subtraction():
    """Testa a subtração: 50 [ENTER] 12 [-] = 38 (L2 - L1)."""
    stack = RPNStack()
    stack.push(50)
    stack.push(12)
    result = stack.execute_op("-")
    assert result == 38.0
    assert stack.get_level(1) == 38.0


def test_multiplication():
    """Testa a multiplicação: 7 [ENTER] 8 [*] = 56."""
    stack = RPNStack()
    stack.push(7)
    stack.push(8)
    result = stack.execute_op("*")
    assert result == 56.0
    assert stack.get_level(1) == 56.0


def test_division():
    """Testa a divisão: 100 [ENTER] 4 [/] = 25 (L2 / L1)."""
    stack = RPNStack()
    stack.push(100)
    stack.push(4)
    result = stack.execute_op("/")
    assert result == 25.0
    assert stack.get_level(1) == 25.0


def test_division_by_zero():
    """Verifica se divisão por zero levanta ZeroDivisionError."""
    stack = RPNStack()
    stack.push(10)
    stack.push(0)
    with pytest.raises(ZeroDivisionError):
        stack.execute_op("/")


def test_swap_xy():
    """Testa a troca entre Nível 1 e Nível 2."""
    stack = RPNStack()
    stack.push(99)
    stack.push(11)
    assert stack.get_level(1) == 11.0
    assert stack.get_level(2) == 99.0

    stack.swap_xy()
    assert stack.get_level(1) == 99.0
    assert stack.get_level(2) == 11.0


def test_drop_and_clear():
    """Testa as funções DROP e CLEAR."""
    stack = RPNStack()
    stack.push(10)
    stack.push(20)
    stack.drop()
    assert stack.get_level(1) == 10.0

    stack.clear()
    assert stack.levels == [0.0, 0.0, 0.0, 0.0, 0.0]
`
  },
  {
    name: "README.md",
    path: "README.md",
    language: "markdown",
    description: "Documentação completa do projeto, guia de instalação do uv e passo a passo de execução.",
    highlights: [
      {
        title: "Guia Rápido com uv",
        explanation: "Comandos prontos para copiar e colar para rodar a aplicação em 2 segundos."
      },
      {
        title: "Explicação dos 5 Níveis RPN",
        explanation: "Demonstração prática de como a notação polonesa reversa calcula expressões sem parênteses."
      }
    ],
    content: `# Calculadora RPN em Python com Pilha de 5 Níveis

Calculadora em Python que utiliza **Notação Polonesa Reversa (RPN)** com **pilha de 5 níveis**, capaz de realizar as **4 operações aritméticas básicas** (+, −, ×, ÷), com interface gráfica simples e organizada via Tkinter, gerenciada com **uv** (o gestor de pacotes e ambientes Python ultrarrápido da Astral).

---

## 🚀 Como Iniciar com \`uv\`

O **[uv](https://github.com/astral-sh/uv)** é uma ferramenta moderna desenvolvida em Rust que substitui \`pip\`, \`virtualenv\`, \`pip-tools\` e \`poetry\` sendo de 10 a 100 vezes mais rápido.

### 1. Instalar o \`uv\` (se ainda não tiver)

- **Linux / macOS:**
  \`\`\`bash
  curl -LsSf https://astral.sh/uv/install.sh | sh
  \`\`\`

- **Windows (PowerShell):**
  \`\`\`powershell
  powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
  \`\`\`

- **Via Pip ou Homebrew (alternativa):**
  \`\`\`bash
  pip install uv
  # ou no mac: brew install uv
  \`\`\`

### 2. Rodar a Calculadora Diretamente

Entre na pasta do projeto e execute:
\`\`\`bash
uv run calculadora
\`\`\`
> ✨ **Mágica do uv:** O \`uv\` cria o ambiente virtual automaticamente, baixa a versão necessária do Python (se não existir) e inicia a interface gráfica instantaneamente.

### 3. Rodar os Testes Automatizados

\`\`\`bash
uv run pytest
\`\`\`

---

## 🧮 Como Funciona o Sistema Polonês (RPN) de 5 Níveis

Na Notação Polonesa Reversa, os **números entram primeiro** e os **operadores vêm depois**. Isso elimina totalmente a necessidade de parênteses e ambiguidades de ordem de precedência.

A calculadora possui **5 níveis visíveis na pilha**:
- **Nível 1 (X)**: O visor ativo / topo da pilha.
- **Nível 2 (Y)**: O valor anterior que sofrerá a operação.
- **Nível 3 (Z)**: Terceiro operando retido na pilha.
- **Nível 4 (T)**: Quarto operando retido na pilha.
- **Nível 5 (U)**: Quinto operando retido na pilha (limite superior).

### Exemplo Prático 1: Somar \`15 + 25\`
1. Digite \`15\` e clique em **ENTER** (o 15 sobe para o Nível 2).
2. Digite \`25\` (fica no Nível 1).
3. Clique em **+**.
4. O resultado \`40\` aparece no Nível 1.

### Exemplo Prático 2: Calcular \`(10 + 20) * (8 - 3)\`
1. \`10\` [ENTER] \`20\` [+] ➔ Nível 1 tem \`30\`
2. [ENTER] (sobe o \`30\` para o Nível 2)
3. \`8\` [ENTER] \`3\` [-] ➔ Nível 1 tem \`5\` (o \`30\` permanece guardado no Nível 2)
4. Clique em **×** ➔ Resultado: \`150\`!

---

## 📂 Estrutura Organizada do Projeto

\`\`\`text
calculadora-rpn/
├── pyproject.toml             # Configuração do projeto e dependências com uv
├── README.md                  # Este guia completo
├── src/
│   └── calculadora_rpn/
│       ├── __init__.py        # Pacote Python
│       ├── stack.py           # Motor RPN puro com pilha de 5 níveis
│       ├── gui.py             # Interface gráfica Tkinter limpa e desacoplada
│       └── main.py            # Ponto de entrada executável
└── tests/
    ├── __init__.py
    └── test_stack.py          # Testes unitários com pytest
\`\`\`

### Principais Componentes Explicados:
1. **\`stack.py\` (Model)**:
   - Mantém uma lista estrita de 5 posições (\`float\`).
   - Gerencia operações LIFO (Last-In, First-Out).
   - Realiza as 4 operações aritméticas com proteção para divisão por zero.
   - Fornece operações clássicas: \`ENTER\`, \`SWAP\` (X⇄Y), \`DROP\` e \`CLEAR\`.

2. **\`gui.py\` (View/Controller)**:
   - Constrói o visor em estilo calculadora científica com os 5 níveis destacados.
   - Painel de botões intuitivo com suporte a cliques e atalhos de teclado.
   - Barra de status com mensagens claras de erro e aviso.

3. **\`pyproject.toml\`**:
   - Define metadados e o script executável \`calculadora = "calculadora_rpn.main:main"\`.

---

## 📦 Geração de Executáveis Nativos (Linux, Windows e macOS)

Para distribuir a calculadora como um **arquivo executável único** sem precisar que o usuário instale Python:

\`\`\`bash
# Executar o script automático multiplataforma com o uv:
uv run python build_executable.py
\`\`\`

- **Windows**: Gera \`dist/calculadora-rpn.exe\` (portátil, sem janela preta de terminal)
- **Linux**: Gera \`dist/calculadora-rpn\` (binário nativo ELF)
- **macOS**: Gera \`dist/Calculadora RPN.app\` (aplicativo nativo para Finder)
`
  },
  {
    name: "build_executable.py",
    path: "build_executable.py",
    language: "python",
    description: "Script de automação multiplataforma que compila a calculadora em executável nativo único para Windows, Linux e macOS.",
    highlights: [
      {
        title: "Detecção Automática do Sistema Operacional",
        explanation: "Identifica se está rodando em Windows, macOS ou Linux e aplica as flags ideais para cada plataforma."
      },
      {
        title: "Arquivo Único Portátil (--onefile)",
        explanation: "Empacota interpretador, bibliotecas e GUI em um só arquivo sem dependências externas."
      },
      {
        title: "Ocultação de Terminal (--windowed)",
        explanation: "Remove a janela preta do console em Windows e macOS, abrindo exclusivamente a interface Tkinter."
      }
    ],
    content: `"""
Script de automação multiplataforma para gerar executáveis nativos
independentes para Windows (.exe), Linux (binário ELF) e macOS (.app bundle).

Uso:
    uv run python build_executable.py
"""

import os
import platform
import subprocess
import sys


def build() -> None:
    current_os = platform.system()
    print("=" * 60)
    print(f"[*] Compilando Executável Nativo da Calculadora RPN no {current_os}...")
    print("=" * 60)

    # Parâmetros base do PyInstaller
    cmd = [
        sys.executable,
        "-m",
        "PyInstaller",
        "--noconfirm",
        "--clean",
        "--onefile",
        "--windowed",
        "src/calculadora_rpn/main.py",
    ]

    if current_os == "Windows":
        cmd.extend(["--name", "calculadora-rpn"])
        expected_output = os.path.join("dist", "calculadora-rpn.exe")
    elif current_os == "Darwin":  # macOS
        cmd.extend([
            "--name", "Calculadora RPN",
            "--osx-bundle-identifier", "com.calculadora.rpn"
        ])
        expected_output = os.path.join("dist", "Calculadora RPN.app")
    else:  # Linux / Unix
        cmd.extend(["--name", "calculadora-rpn"])
        expected_output = os.path.join("dist", "calculadora-rpn")

    print(f"[*] Executando comando de compilação:")
    print(f"    {' '.join(cmd)}\n")

    result = subprocess.run(cmd)

    if result.returncode == 0:
        print("\n" + "=" * 60)
        print("[+] SUCESSO! Executável nativo gerado com sucesso!")
        print(f"[+] Arquivo pronto em: {expected_output}")
        print("=" * 60)
    else:
        print(f"\n[-] Erro durante a geração do executável (código de retorno: {result.returncode}).")
        sys.exit(result.returncode)


if __name__ == "__main__":
    build()
`
  },
  {
    name: "build-executables.yml",
    path: ".github/workflows/build-executables.yml",
    language: "yaml",
    description: "Automação em nuvem (CI/CD GitHub Actions) que compila simultaneamente para Windows, Linux e macOS.",
    highlights: [
      {
        title: "Matriz Multi-SO",
        explanation: "Compila automaticamente em máquinas virtuais Windows, Ubuntu Linux e macOS em paralelo."
      },
      {
        title: "Integração Oficial astral-sh/setup-uv",
        explanation: "Utiliza a action oficial do uv para sincronizar dependências e rodar o empacotador em segundos."
      },
      {
        title: "Upload de Artefatos Prontos",
        explanation: "Disponibiliza os 3 arquivos executáveis para download direto no GitHub."
      }
    ],
    content: `name: Gerar Executáveis Nativos (Linux, Windows, macOS)

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    name: Build para \${{ matrix.os }}
    runs-on: \${{ matrix.os }}
    strategy:
      matrix:
        include:
          - os: windows-latest
            artifact_name: calculadora-rpn-windows.exe
            dist_path: dist/calculadora-rpn.exe
          - os: ubuntu-latest
            artifact_name: calculadora-rpn-linux
            dist_path: dist/calculadora-rpn
          - os: macos-latest
            artifact_name: calculadora-rpn-macos
            dist_path: dist/Calculadora RPN.app

    steps:
      - name: Checkout do código
        uses: actions/checkout@v4

      - name: Configurar uv (Astral)
        uses: astral-sh/setup-uv@v5
        with:
          version: "latest"

      - name: Sincronizar Dependências do Projeto
        run: uv sync --dev

      - name: Compilar Executável Nativo com PyInstaller
        run: uv run python build_executable.py

      - name: Disponibilizar Executável para Download
        uses: actions/upload-artifact@v4
        with:
          name: \${{ matrix.artifact_name }}
          path: \${{ matrix.dist_path }}
`
  },
  {
    name: ".gitignore",
    path: ".gitignore",
    language: "gitignore",
    description: "Arquivos ignorados pelo controle de versão.",
    highlights: [
      {
        title: "Ignora cache e ambientes virtuais",
        explanation: "Evita comitar pastas .venv geradas pelo uv, caches __pycache__ e relatórios de teste."
      }
    ],
    content: `.venv/
__pycache__/
*.py[cod]
*$py.class
.pytest_cache/
dist/
build/
*.egg-info/
.DS_Store
`
  }
];

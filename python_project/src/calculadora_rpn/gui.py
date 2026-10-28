"""
Interface Gráfica (GUI) para a Calculadora RPN de 5 Níveis usando tkinter.
Desenvolvida com foco em simplicidade, elegância, feedback sonoro e facilidade de manutenção.
"""

import tkinter as tk
from tkinter import ttk
from typing import Optional
from calculadora_rpn.stack import RPNStack
from calculadora_rpn.audio import SoundManager


class RPNCalculatorGUI:
    """Interface gráfica simples e organizada para calculadora RPN com som idêntico à web."""

    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.root.title("Calculadora RPN (5 Níveis)")
        self.root.geometry("380x630")
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

        # Gerenciador de som sintetizado (idêntico à versão Web)
        self.sound_mgr = SoundManager(self.root)

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

        # Encerramento seguro da janela e limpeza de buffers
        self.root.protocol("WM_DELETE_WINDOW", self._on_close)

        # Atualiza o display inicial
        self._refresh_display()

    def _setup_styles(self) -> None:
        """Configura estilos ttk para botões e caixas."""
        style = ttk.Style()
        style.theme_use("clam")

    def _play_sound(self, sound_type: str = "num") -> None:
        """Emite feedback sonoro tátil idêntico à versão web."""
        self.sound_mgr.play(sound_type)

    def _toggle_sound(self) -> None:
        """Ativa/desativa os efeitos sonoros."""
        is_active = self.sound_mgr.toggle_mute()
        if is_active:
            self.btn_sound.config(text="🔊 Som Ativo", fg=self.success_color)
            self.status_var.set("Sons ativados (timbres Web Audio).")
        else:
            self.btn_sound.config(text="🔇 Mudo", fg="#9399b2")
            self.status_var.set("Sons desativados.")

    def _on_close(self) -> None:
        """Libera arquivos temporários e fecha o app."""
        try:
            self.sound_mgr.cleanup()
        finally:
            self.root.destroy()

    def _build_header(self) -> None:
        """Cabeçalho simples com título e botão de alternar som."""
        header_frame = tk.Frame(self.root, bg=self.bg_color)
        header_frame.pack(fill=tk.X, padx=16, pady=(12, 6))

        title_col = tk.Frame(header_frame, bg=self.bg_color)
        title_col.pack(side=tk.LEFT, anchor="w")

        title = tk.Label(
            title_col,
            text="Calculadora RPN",
            font=("Helvetica", 14, "bold"),
            fg=self.text_color,
            bg=self.bg_color,
        )
        title.pack(anchor="w")

        subtitle = tk.Label(
            title_col,
            text="Notação Polonesa Reversa • Pilha de 5 Níveis",
            font=("Helvetica", 9),
            fg="#a6adc8",
            bg=self.bg_color,
        )
        subtitle.pack(anchor="w")

        # Botão de Som
        self.btn_sound = tk.Button(
            header_frame,
            text="🔊 Som Ativo",
            command=self._toggle_sound,
            font=("Helvetica", 8, "bold"),
            bg="#313244",
            fg=self.success_color,
            activebackground="#45475a",
            relief=tk.FLAT,
            bd=0,
            padx=8,
            pady=4,
            cursor="hand2",
        )
        self.btn_sound.pack(side=tk.RIGHT, anchor="e")

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

    # --- Lógica de Eventos e Feedback Sonoro ---

    def _on_digit(self, digit: str) -> None:
        """Adiciona um dígito numérico ao buffer atual com som."""
        self._play_sound("num")
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
        """Insere ponto decimal se ainda não existir com som."""
        self._play_sound("num")
        if not self.is_entering_number:
            self.current_entry = "0."
            self.is_entering_number = True
        elif "." not in self.current_entry:
            self.current_entry += "."

        val = float(self.current_entry) if self.current_entry != "." else 0.0
        self.stack.set_level_1(val)
        self._refresh_display()

    def _on_toggle_sign(self) -> None:
        """Inverte o sinal (+ / -) do valor no Nível 1 com som."""
        self._play_sound("num")
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
        self._play_sound("num")
        if self.is_entering_number and len(self.current_entry) > 0:
            self.current_entry = self.current_entry[:-1]
            val = float(self.current_entry) if self.current_entry and self.current_entry != "-" else 0.0
            self.stack.set_level_1(val)
            self._refresh_display()

    def _on_enter(self) -> None:
        """Confirma a entrada do número e empilha com som harmônico."""
        self._play_sound("enter")
        self.stack.enter()
        self.is_entering_number = False
        self.current_entry = ""
        self._refresh_display()
        self.status_var.set("ENTER: Valor empurrado para o Nível 2.")

    def _on_operator(self, op: str) -> None:
        """Executa uma das 4 operações aritméticas básicas com som."""
        self.is_entering_number = False
        self.current_entry = ""
        try:
            res = self.stack.execute_op(op)
            self._play_sound("op")
            self._refresh_display()
            op_names = {"+": "Soma", "-": "Subtração", "*": "Multiplicação", "/": "Divisão"}
            self.status_var.set(f"{op_names.get(op, op)} realizada com sucesso!")
        except ZeroDivisionError as err:
            self._play_sound("error")
            self.status_var.set(f"Aviso: {err}")
        except Exception as err:
            self._play_sound("error")
            self.status_var.set(f"Erro: {err}")

    def _on_swap(self) -> None:
        """Troca o Nível 1 e o Nível 2 com som."""
        self._play_sound("num")
        self.is_entering_number = False
        self.current_entry = ""
        self.stack.swap_xy()
        self._refresh_display()
        self.status_var.set("SWAP: Nível 1 e Nível 2 trocados.")

    def _on_drop(self) -> None:
        """Descarta o Nível 1 com som."""
        self._play_sound("clear")
        self.is_entering_number = False
        self.current_entry = ""
        self.stack.drop()
        self._refresh_display()
        self.status_var.set("DROP: Nível 1 descartado.")

    def _on_clear(self) -> None:
        """Limpa toda a pilha de 5 níveis com som."""
        self._play_sound("clear")
        self.is_entering_number = False
        self.current_entry = ""
        self.stack.clear()
        self._refresh_display()
        self.status_var.set("CLEAR: Pilha de 5 níveis reiniciada.")

    def _format_number(self, num: float) -> str:
        """Formata o número para evitar notação com excesso de zeros."""
        if num == int(num):
            return str(int(num))
        formatted = f"{num:.6f}".rstrip("0").rstrip(".")
        return formatted

    def _refresh_display(self) -> None:
        """Atualiza os textos das labels de cada um dos 5 níveis."""
        levels = self.stack.levels
        for i in range(1, 6):
            val = levels[i - 1]
            txt = self._format_number(val)
            self.level_labels[i].config(text=txt)

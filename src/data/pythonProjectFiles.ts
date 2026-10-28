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
    name: "audio.py",
    path: "src/calculadora_rpn/audio.py",
    language: "python",
    description: "Módulo de síntese sonora que reproduz timbres idênticos à versão web usando apenas a biblioteca padrão.",
    highlights: [
      {
        title: "Timbres Idênticos à Web",
        explanation: "Sintetiza ondas senoidais para cliques, arpejos para ENTER e ondas dente de serra para avisos."
      },
      {
        title: "Zero Dependências Externas",
        explanation: "Utiliza os módulos wave, math e struct nativos do Python com winsound no Windows e aplay/afplay/bell no Linux/Mac."
      },
      {
        title: "Execução Assíncrona Não-Bloqueante",
        explanation: "Os efeitos são disparados em threads daemon para nunca congelar a interface gráfica do Tkinter."
      }
    ],
    content: `"""
Módulo de efeitos sonoros sintetizados para a Calculadora RPN em Python.
Gera e reproduz timbres sonoros idênticos à versão web (Web Audio API)
utilizando exclusivamente a biblioteca padrão do Python (sem dependências externas).
"""

import io
import math
import os
import platform
import struct
import subprocess
import tempfile
import threading
import wave
from typing import Dict, Optional

# Tenta carregar winsound no Windows
try:
    if platform.system() == "Windows":
        import winsound
    else:
        winsound = None
except Exception:
    winsound = None


def generate_tone_wav(freq: float, duration_ms: int, waveform: str = "sine", end_freq: Optional[float] = None) -> bytes:
    """Gera um arquivo WAV de 16-bit mono em memória."""
    sample_rate = 22050
    total_samples = int(sample_rate * (duration_ms / 1000.0))
    buffer = io.BytesIO()

    with wave.open(buffer, "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)

        frames = bytearray()
        for i in range(total_samples):
            t = i / sample_rate
            progress = i / total_samples

            current_freq = freq + (end_freq - freq) * progress if end_freq else freq
            envelope = math.exp(-3.5 * progress)

            if waveform == "triangle":
                phase = (t * current_freq) % 1.0
                sample_val = (4.0 * abs(phase - 0.5) - 1.0)
            elif waveform == "sawtooth":
                phase = (t * current_freq) % 1.0
                sample_val = (2.0 * phase - 1.0)
            else:
                sample_val = math.sin(2.0 * math.pi * current_freq * t)

            amplitude = int(32767 * 0.4 * envelope * sample_val)
            amplitude = max(-32768, min(32767, amplitude))
            frames.extend(struct.pack("<h", amplitude))

        wav_file.writeframes(frames)

    return buffer.getvalue()


class SoundManager:
    """Gerenciador de áudio multiplataforma com timbres idênticos ao demo Web."""

    def __init__(self, root_tk=None) -> None:
        self.root_tk = root_tk
        self.is_muted = False
        self.os_name = platform.system()
        self._wav_cache: Dict[str, bytes] = {}
        self._temp_files: Dict[str, str] = {}

        try:
            self._wav_cache["num"] = generate_tone_wav(440.0, 45, "sine")
            self._wav_cache["enter"] = generate_tone_wav(587.33, 90, "triangle", end_freq=880.0)
            self._wav_cache["op"] = generate_tone_wav(659.25, 60, "sine")
            self._wav_cache["clear"] = generate_tone_wav(320.0, 80, "sawtooth")
            self._wav_cache["error"] = generate_tone_wav(180.0, 160, "sawtooth", end_freq=120.0)
        except Exception:
            pass

    def toggle_mute(self) -> bool:
        """Alterna entre mudo e ativo. Retorna True se o som estiver ATIVO."""
        self.is_muted = not self.is_muted
        if not self.is_muted:
            self.play("enter")
        return not self.is_muted

    def play(self, sound_type: str = "num") -> None:
        """Reproduz o som de forma assíncrona sem travar a interface gráfica."""
        if self.is_muted:
            return

        threading.Thread(target=self._play_worker, args=(sound_type,), daemon=True).start()

    def _play_worker(self, sound_type: str) -> None:
        try:
            if winsound is not None:
                wav_bytes = self._wav_cache.get(sound_type)
                if wav_bytes:
                    winsound.PlaySound(wav_bytes, winsound.SND_MEMORY | winsound.SND_ASYNC)
                    return
                freq_map = {"num": 880, "enter": 1174, "op": 1318, "clear": 520, "error": 300}
                winsound.Beep(freq_map.get(sound_type, 880), 30)
                return

            if self.os_name == "Darwin":
                temp_path = self._get_temp_wav(sound_type)
                if temp_path and os.path.exists(temp_path):
                    subprocess.run(["afplay", temp_path], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                    return

            if self.os_name == "Linux":
                temp_path = self._get_temp_wav(sound_type)
                if temp_path and os.path.exists(temp_path):
                    for player in ["aplay", "paplay"]:
                        res = subprocess.run([player, "-q", temp_path], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                        if res.returncode == 0:
                            return

            if self.root_tk:
                self.root_tk.bell()
        except Exception:
            try:
                if self.root_tk:
                    self.root_tk.bell()
            except Exception:
                pass

    def _get_temp_wav(self, sound_type: str) -> Optional[str]:
        if sound_type in self._temp_files:
            return self._temp_files[sound_type]

        wav_bytes = self._wav_cache.get(sound_type)
        if not wav_bytes:
            return None

        try:
            temp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
            temp.write(wav_bytes)
            temp.close()
            self._temp_files[sound_type] = temp.name
            return temp.name
        except Exception:
            return None

    def cleanup(self) -> None:
        for path in self._temp_files.values():
            try:
                if os.path.exists(path):
                    os.remove(path)
            except Exception:
                pass
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

Calculadora em Python que utiliza **Notação Polonesa Reversa (RPN)** com **pilha de 5 níveis**, capaz de realizar as **4 operações aritméticas básicas** (+, −, ×, ÷), com interface gráfica organizada via **Tkinter** (nativa do Python) e gerenciada pelo **uv** (o gestor moderno de pacotes e ambientes da Astral).

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

\`\`\`text
┌──────────────────────────────────────────────┐
│ Nível 5 (U)                             0.0  │  <- Limite superior / overflow
│ Nível 4 (T)                             0.0  │  <- Armazenamento intermediário
│ Nível 3 (Z)                             0.0  │  <- Armazenamento intermediário
│ Nível 2 (Y)                             0.0  │  <- Base / 1º operando
│ Nível 1 (X)                             0.0  │  <- Registro ativo / Entrada
└──────────────────────────────────────────────┘
\`\`\`

### Controles & Teclas Principais
- **ENTER ↵**: Confirma o valor digitado no Nível 1 e o empurra para o Nível 2. Todos os níveis existentes sobem uma posição.
- **+ , − , × , ÷**: Executam a operação aritmética entre o **Nível 2** (primeiro operando) e o **Nível 1** (segundo operando). O resultado substitui o Nível 1 e a pilha desce.
- **SWAP (X⇄Y)**: Inverte os valores entre o Nível 1 e o Nível 2.
- **DROP**: Descarta o valor atual do Nível 1; os níveis superiores descem.
- **CLEAR**: Zera instantaneamente todos os 5 níveis da pilha.
- **±**: Inverte o sinal (+ / -) do número em digitação ou do Nível 1.

### Atalhos de Teclado Físico
Você pode utilizar o seu teclado numérico normal:
- **0 a 9** e **.** : Digitação de números e decimais
- **Enter** ou **NumPad Enter**: Tecla ENTER da pilha
- **+**, **-**, **\***, **/** : Operações aritméticas imediatas
- **Backspace**: Apagar último dígito digitado
- **Escape (Esc)**: Limpar a pilha (CLEAR)

---

## 2. Estrutura do Código & Arquitetura

O projeto foi construído seguindo o padrão **MVC (Model-View-Controller)**, garantindo que o motor matemático da pilha funcione de forma 100% independente da interface gráfica.

### Árvore de Arquivos

\`\`\`text
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
\`\`\`

### Principais Módulos:

1. **\`src/calculadora_rpn/stack.py\` (Motor da Pilha)**:
   - Mantém uma lista estrita de tamanho 5: \`self._levels = [0.0] * 5\`.
   - Implementa o comportamento **LIFO** (Last-In, First-Out).
   - Realiza cálculo seguro com tratamento de \`ZeroDivisionError\` (divisão por zero tratada com exceção amigável).
   - Suporta funções de manipulação de pilha: \`push\`, \`pop\`, \`enter\`, \`swap_xy\`, \`drop\`, \`clear\` e \`roll_down\`.

2. **\`src/calculadora_rpn/gui.py\` (Interface Gráfica Tkinter)**:
   - Utiliza exclusivamente \`tkinter\`, que já vem instalado com o Python em todos os sistemas operacionais.
   - Não requer bibliotecas pesadas de terceiros (como Qt ou wxWidgets).
   - Barra de status com mensagens claras de sucesso e aviso.
   - Vinculação de eventos de teclado com \`root.bind(...)\`.

3. **\`tests/test_stack.py\` (Testes com Pytest)**:
   - Testa soma, subtração, multiplicação e divisão.
   - Testa o limite e descarte ao ultrapassar o 5º nível.
   - Testa a proteção contra divisão por zero (\`pytest.raises(ZeroDivisionError)\`).

---

## 3. O que é RPN? (Notação Polonesa Reversa)

A **Notação Polonesa Reversa** (conhecida internacionalmente como **RPN** ou *Postfix Notation*) foi inventada pelo matemático e lógico polonês **Jan Łukasiewicz** em 1924, e adaptada para computação pelo cientista Charles Hamblin na década de 1950.

Tornou-se mundialmente famosa após ser adotada pela **Hewlett-Packard (HP)** em suas icônicas calculadoras científicas e financeiras (HP-35, HP-12C, HP-48G).

### Por que a RPN é Superior?

Na notação tradicional (Infixa), o operador fica no meio dos operandos: \`5 + 3\`.
Na RPN (Posfixa), os operandos entram primeiro e o operador vem depois: \`5 3 +\`.

| Notação Algébrica Tradicional (Infixa) | Notação Polonesa Reversa (RPN / Posfixa) |
| :--- | :--- |
| Exige parênteses para forçar precedência | **Zero parênteses necessários** |
| O cálculo só acontece ao pressionar \`=\` | **Cálculo imediato** a cada operador |
| Mais toques de tecla (em média 30% a mais) | **Fluxo mais rápido e eficiente** |
| Erros fáceis ao esquecer de fechar \`)\` | **Sem ambiguidades sintáticas** |

### Exemplo Prático 1: Somar \`(15 + 25) × 3\`

1. Digite \`15\` e pressione **ENTER** (o 15 sobe para o Nível 2).
2. Digite \`25\` e pressione **+** (o resultado intermediário \`40\` surge imediatamente no Nível 1).
3. Pressione **ENTER** (o 40 sobe para o Nível 2).
4. Digite \`3\` e pressione **×** (o resultado final \`120\` aparece no visor).

### Exemplo Prático 2: Expressão complexa \`(10 + 20) / (8 - 3)\`

- **Na calculadora tradicional**: \`(\` \`1\` \`0\` \`+\` \`2\` \`0\` \`)\` \`÷\` \`(\` \`8\` \`−\` \`3\` \`)\` \`=\` (12 toques de tecla)
- **Na RPN**:
  1. \`10 [ENTER] 20 [+]\` ➔ Gera \`30\`
  2. \`[ENTER]\` ➔ Guarda o \`30\` no Nível 2
  3. \`8 [ENTER] 3 [−]\` ➔ Gera \`5\` (o \`30\` continua preservado no Nível 2)
  4. \`[÷]\` ➔ Divide \`30 / 5\` e exibe o resultado final \`6.0\`! (Apenas 8 toques)

---

## 4. Guia Completo do uv

O **[uv](https://github.com/astral-sh/uv)** é a ferramenta de empacotamento e gestão de ambientes Python de última geração, desenvolvida em **Rust** pela equipe da Astral.

Ele substitui com vantagens extremas as ferramentas antigas:
- Substitui o \`pip\` (sendo de 10 a 100 vezes mais rápido).
- Substitui o \`virtualenv\` e o comando \`python -m venv\` (gerenciamento automático de \`.venv\`).
- Substitui ferramentas complexas como \`poetry\` e \`pip-tools\`.

### 1. Como Instalar o uv

- **Linux e macOS:**
  \`\`\`bash
  curl -LsSf https://astral.sh/uv/install.sh | sh
  \`\`\`

- **Windows (PowerShell):**
  \`\`\`powershell
  powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
  \`\`\`

- **Alternativa via Pip ou Homebrew:**
  \`\`\`bash
  pip install uv
  # ou no macOS:
  brew install uv
  \`\`\`

### 2. Comandos do Dia a Dia

| O que você quer fazer | Comando com o uv |
| :--- | :--- |
| **Iniciar a Calculadora** | \`uv run calculadora\` |
| **Rodar os Testes Automatizados** | \`uv run pytest\` |
| **Gerar o Executável Nativo** | \`uv run python build_executable.py\` |
| **Adicionar uma nova biblioteca** | \`uv add nome_do_pacote\` |
| **Adicionar dependência de dev** | \`uv add --dev pytest\` |
| **Criar/recriar ambiente virtual** | \`uv venv\` |
| **Visualizar árvore de pacotes** | \`uv tree\` |

> ✨ **A grande vantagem do \`uv run\`:** Você **não precisa ativar manualmente** o ambiente virtual (\`source .venv/bin/activate\` ou \`.venv\\Scripts\\activate\`). O \`uv run\` detecta o ambiente, sincroniza as dependências em milissegundos e roda o script diretamente!

---

## 5. Gerar Executáveis Nativos (Windows, Linux, macOS)

Você pode transformar esta calculadora em um **arquivo executável único e portátil**, que pode ser compartilhado com qualquer pessoa sem que ela precise ter Python instalado.

O empacotamento reúne em um único arquivo:
- O interpretador Python otimizado.
- As bibliotecas nativas do Tkinter e Tcl.
- O código-fonte da aplicação.

### Método 1: Script Automático Multiplataforma (Recomendado)

Criamos o arquivo \`build_executable.py\`, que detecta em qual sistema você está e compila com as opções ideais:

\`\`\`bash
uv run python build_executable.py
\`\`\`

- **No Windows**: Cria \`dist/calculadora-rpn.exe\` (portátil, com o terminal preto ocultado via \`--noconsole\`).
- **No Linux**: Cria \`dist/calculadora-rpn\` (binário nativo ELF compatível com Ubuntu, Debian, Fedora, Arch, etc.).
- **No macOS**: Cria \`dist/Calculadora RPN.app\` (pacote \`.app\` pronto para execução com duplo clique no Finder).

### Método 2: Comandos Diretos com o PyInstaller

Se preferir rodar o comando manual:

- **Windows:**
  \`\`\`powershell
  uv run pyinstaller --onefile --noconsole --name "calculadora-rpn" src/calculadora_rpn/main.py
  \`\`\`

- **Linux:**
  \`\`\`bash
  uv run pyinstaller --onefile --windowed --name "calculadora-rpn" src/calculadora_rpn/main.py
  \`\`\`

- **macOS:**
  \`\`\`bash
  uv run pyinstaller --onefile --windowed --name "Calculadora RPN" --osx-bundle-identifier com.calculadora.rpn src/calculadora_rpn/main.py
  \`\`\`

### Método 3: Compilação Automática na Nuvem (GitHub Actions)

O projeto inclui o fluxo de CI/CD \`.github/workflows/build-executables.yml\`.

Quando você envia o código para um repositório no GitHub:
1. O GitHub inicia 3 máquinas virtuais paralelas: **Windows**, **Ubuntu Linux** e **macOS**.
2. Cada máquina compila o executável nativo do respectivo sistema operacional.
3. Os 3 arquivos prontos para distribuição ficam disponíveis para download direto na aba **Actions** ou **Releases** do seu repositório.

---

## 📄 Licença
Este projeto é de código aberto e está sob a licença MIT / Apache 2.0. Sinta-se livre para usar, estudar e modificar!
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

    print("[*] Executando comando de compilação:")
    print("    " + " ".join(cmd))
    print()

    result = subprocess.run(cmd)

    if result.returncode == 0:
        print()
        print("=" * 60)
        print("[+] SUCESSO! Executável nativo gerado com sucesso!")
        print(f"[+] Arquivo pronto em: {expected_output}")
        print("=" * 60)
    else:
        print()
        print(f"[-] Erro durante a geração do executável (código de retorno: {result.returncode}).")
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

"""
Ponto de entrada executável para a Calculadora RPN em Python.
Inicia a janela gráfica Tkinter e conecta o motor de pilha de 5 níveis.
"""

import tkinter as tk
from calculadora_rpn.gui import RPNCalculatorGUI


def main() -> None:
    """Função principal invocada pelo comando 'uv run calculadora'."""
    root = tk.Tk()
    app = RPNCalculatorGUI(root)
    root.mainloop()


if __name__ == "__main__":
    main()

"""
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

    def percent(self) -> float:
        """
        Calcula a porcentagem segundo a convenção clássica RPN (HP):
        - Nível 2 (Y) é o valor base.
        - Nível 1 (X) é a taxa percentual.
        - Resultado = (Y * X) / 100.0.
        
        O resultado é colocado no Nível 1 (X), mantendo o Nível 2 (Y) preservado.
        Isso permite pressionar imediatamente [+] para somar acréscimo (ex: taxa/imposto)
        ou [-] para subtrair desconto.
        
        Se o Nível 2 for 0.0, calcula a taxa unitária (X / 100.0).
        """
        val_x = self.get_level(1)
        val_y = self.get_level(2)

        if val_y != 0.0:
            result = (val_y * val_x) / 100.0
        else:
            result = val_x / 100.0

        self.set_level_1(result)
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

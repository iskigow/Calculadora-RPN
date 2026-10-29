"""
Testes unitários para o motor de pilha RPN de 5 níveis.
Executar com:
    uv run pytest
ou
    python3 -m unittest discover -s tests
"""

import unittest
from calculadora_rpn.stack import RPNStack


class TestRPNStack(unittest.TestCase):
    def test_initial_state(self):
        stack = RPNStack()
        self.assertEqual(len(stack.levels), 5)
        self.assertEqual(stack.levels, [0.0, 0.0, 0.0, 0.0, 0.0])

    def test_push_and_shift_up_to_5_levels(self):
        stack = RPNStack()
        for val in [10, 20, 30, 40, 50]:
            stack.push(val)

        self.assertEqual(stack.get_level(1), 50.0)
        self.assertEqual(stack.get_level(2), 40.0)
        self.assertEqual(stack.get_level(3), 30.0)
        self.assertEqual(stack.get_level(4), 20.0)
        self.assertEqual(stack.get_level(5), 10.0)

        stack.push(60)
        self.assertEqual(stack.get_level(1), 60.0)
        self.assertEqual(stack.get_level(5), 20.0)

    def test_addition(self):
        stack = RPNStack()
        stack.push(15)
        stack.push(25)
        self.assertEqual(stack.execute_op("+"), 40.0)
        self.assertEqual(stack.get_level(1), 40.0)

    def test_subtraction(self):
        stack = RPNStack()
        stack.push(50)
        stack.push(12)
        self.assertEqual(stack.execute_op("-"), 38.0)
        self.assertEqual(stack.get_level(1), 38.0)

    def test_multiplication(self):
        stack = RPNStack()
        stack.push(7)
        stack.push(8)
        self.assertEqual(stack.execute_op("*"), 56.0)
        self.assertEqual(stack.get_level(1), 56.0)

    def test_division(self):
        stack = RPNStack()
        stack.push(100)
        stack.push(4)
        self.assertEqual(stack.execute_op("/"), 25.0)
        self.assertEqual(stack.get_level(1), 25.0)

    def test_division_by_zero(self):
        stack = RPNStack()
        stack.push(10)
        stack.push(0)
        with self.assertRaises(ZeroDivisionError):
            stack.execute_op("/")

    def test_swap_xy(self):
        stack = RPNStack()
        stack.push(99)
        stack.push(11)
        stack.swap_xy()
        self.assertEqual(stack.get_level(1), 99.0)
        self.assertEqual(stack.get_level(2), 11.0)

    def test_drop_and_clear(self):
        stack = RPNStack()
        stack.push(10)
        stack.push(20)
        stack.drop()
        self.assertEqual(stack.get_level(1), 10.0)
        stack.clear()
        self.assertEqual(stack.levels, [0.0, 0.0, 0.0, 0.0, 0.0])

    def test_percent_with_base_value(self):
        stack = RPNStack()
        stack.push(200)  # Base em Y
        stack.push(15)   # Taxa em X (15%)
        result = stack.percent()
        self.assertEqual(result, 30.0)
        self.assertEqual(stack.get_level(1), 30.0)
        # A base em Nível 2 (Y) deve ser mantida intacta
        self.assertEqual(stack.get_level(2), 200.0)
        # Permite somar o imposto/acréscimo imediatamente
        total = stack.execute_op("+")
        self.assertEqual(total, 230.0)
        self.assertEqual(stack.get_level(1), 230.0)

    def test_percent_discount(self):
        stack = RPNStack()
        stack.push(200)
        stack.push(15)
        stack.percent()
        # Permite subtrair o desconto imediatamente
        total = stack.execute_op("-")
        self.assertEqual(total, 170.0)
        self.assertEqual(stack.get_level(1), 170.0)

    def test_percent_unary(self):
        stack = RPNStack()
        stack.push(75)
        result = stack.percent()
        self.assertEqual(result, 0.75)
        self.assertEqual(stack.get_level(1), 0.75)


if __name__ == "__main__":
    unittest.main()

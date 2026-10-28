"""
Testes unitários para o motor de pilha RPN de 5 níveis.
Executar com:
    uv run pytest
"""

import pytest
from calculadora_rpn.stack import RPNStack


def test_initial_state():
    stack = RPNStack()
    assert len(stack.levels) == 5
    assert stack.levels == [0.0, 0.0, 0.0, 0.0, 0.0]


def test_push_and_shift_up_to_5_levels():
    stack = RPNStack()
    for val in [10, 20, 30, 40, 50]:
        stack.push(val)

    assert stack.get_level(1) == 50.0
    assert stack.get_level(2) == 40.0
    assert stack.get_level(3) == 30.0
    assert stack.get_level(4) == 20.0
    assert stack.get_level(5) == 10.0

    stack.push(60)
    assert stack.get_level(1) == 60.0
    assert stack.get_level(5) == 20.0


def test_addition():
    stack = RPNStack()
    stack.push(15)
    stack.push(25)
    assert stack.execute_op("+") == 40.0
    assert stack.get_level(1) == 40.0


def test_subtraction():
    stack = RPNStack()
    stack.push(50)
    stack.push(12)
    assert stack.execute_op("-") == 38.0
    assert stack.get_level(1) == 38.0


def test_multiplication():
    stack = RPNStack()
    stack.push(7)
    stack.push(8)
    assert stack.execute_op("*") == 56.0
    assert stack.get_level(1) == 56.0


def test_division():
    stack = RPNStack()
    stack.push(100)
    stack.push(4)
    assert stack.execute_op("/") == 25.0
    assert stack.get_level(1) == 25.0


def test_division_by_zero():
    stack = RPNStack()
    stack.push(10)
    stack.push(0)
    with pytest.raises(ZeroDivisionError):
        stack.execute_op("/")


def test_swap_xy():
    stack = RPNStack()
    stack.push(99)
    stack.push(11)
    stack.swap_xy()
    assert stack.get_level(1) == 99.0
    assert stack.get_level(2) == 11.0


def test_drop_and_clear():
    stack = RPNStack()
    stack.push(10)
    stack.push(20)
    stack.drop()
    assert stack.get_level(1) == 10.0
    stack.clear()
    assert stack.levels == [0.0, 0.0, 0.0, 0.0, 0.0]

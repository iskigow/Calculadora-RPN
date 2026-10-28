"""
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
        print(f"[-] Erro durante a geração do executável (código: {result.returncode}).")
        sys.exit(result.returncode)


if __name__ == "__main__":
    build()

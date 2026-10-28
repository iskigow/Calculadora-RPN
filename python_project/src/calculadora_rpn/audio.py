"""
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
    """
    Gera um arquivo WAV de 16-bit mono em memória com a frequência e forma de onda especificadas.
    """
    sample_rate = 22050
    total_samples = int(sample_rate * (duration_ms / 1000.0))
    buffer = io.BytesIO()

    with wave.open(buffer, "wb") as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)

        frames = bytearray()
        for i in range(total_samples):
            t = i / sample_rate
            progress = i / total_samples

            # Frequência com modulação linear se end_freq for fornecido (ex: efeito ENTER ou ERROR)
            current_freq = freq + (end_freq - freq) * progress if end_freq else freq

            # Envelope de decaimento exponencial suave (fade out suave como na Web Audio API)
            envelope = math.exp(-3.5 * progress)

            if waveform == "triangle":
                # Onda triangular
                phase = (t * current_freq) % 1.0
                sample_val = (4.0 * abs(phase - 0.5) - 1.0)
            elif waveform == "sawtooth":
                # Onda dente de serra
                phase = (t * current_freq) % 1.0
                sample_val = (2.0 * phase - 1.0)
            else:
                # Onda senoidal (padrão)
                sample_val = math.sin(2.0 * math.pi * current_freq * t)

            amplitude = int(32767 * 0.4 * envelope * sample_val)
            # Limita ao intervalo de 16-bit
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

        # Pré-gera os timbres sonoros idênticos aos da Web Audio API
        try:
            # 1. Numérico (clique suave senoidal em 440 Hz)
            self._wav_cache["num"] = generate_tone_wav(440.0, 45, "sine")

            # 2. ENTER (arpejo harmônico ascendente de 587 Hz para 880 Hz)
            self._wav_cache["enter"] = generate_tone_wav(587.33, 90, "triangle", end_freq=880.0)

            # 3. Operador (+ - * /) (som senoidal mais agudo em 659 Hz)
            self._wav_cache["op"] = generate_tone_wav(659.25, 60, "sine")

            # 4. Limpar / Drop (dente de serra em 320 Hz)
            self._wav_cache["clear"] = generate_tone_wav(320.0, 80, "sawtooth")

            # 5. Erro (som descendente de 180 Hz para 120 Hz)
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
            # Opção A: Windows usando winsound com buffer WAV em memória (som 100% idêntico)
            if winsound is not None:
                wav_bytes = self._wav_cache.get(sound_type)
                if wav_bytes:
                    winsound.PlaySound(wav_bytes, winsound.SND_MEMORY | winsound.SND_ASYNC)
                    return
                # Fallback para Beep nativo se o buffer falhar
                freq_map = {"num": 880, "enter": 1174, "op": 1318, "clear": 520, "error": 300}
                winsound.Beep(freq_map.get(sound_type, 880), 30)
                return

            # Opção B: macOS usando utilitário nativo afplay
            if self.os_name == "Darwin":
                temp_path = self._get_temp_wav(sound_type)
                if temp_path and os.path.exists(temp_path):
                    subprocess.run(["afplay", temp_path], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                    return

            # Opção C: Linux usando aplay ou paplay
            if self.os_name == "Linux":
                temp_path = self._get_temp_wav(sound_type)
                if temp_path and os.path.exists(temp_path):
                    # Tenta aplay (ALSA) ou paplay (PulseAudio)
                    for player in ["aplay", "paplay"]:
                        res = subprocess.run([player, "-q", temp_path], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                        if res.returncode == 0:
                            return

            # Opção D: Fallback Tkinter Bell universal
            if self.root_tk:
                self.root_tk.bell()
        except Exception:
            try:
                if self.root_tk:
                    self.root_tk.bell()
            except Exception:
                pass

    def _get_temp_wav(self, sound_type: str) -> Optional[str]:
        """Salva o WAV em arquivo temporário sob demanda para players Unix."""
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
        """Limpa arquivos temporários ao fechar o app."""
        for path in self._temp_files.values():
            try:
                if os.path.exists(path):
                    os.remove(path)
            except Exception:
                pass

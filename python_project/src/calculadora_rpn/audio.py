"""
Módulo de efeitos sonoros sintetizados para a Calculadora RPN em Python.
Gera e reproduz timbres sonoros idênticos à versão web (Web Audio API)
utilizando frequências sintetizadas puras, sem acionar sons de alerta ou erro do sistema operacional.
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

# Suporte nativo ao Windows sem bibliotecas externas
try:
    if platform.system() == "Windows":
        import winsound
    else:
        winsound = None
except Exception:
    winsound = None


def generate_tone_wav(freq: float, duration_ms: int, waveform: str = "sine", end_freq: Optional[float] = None) -> bytes:
    """Gera um arquivo WAV de 16-bit mono em memória com decaimento suave."""
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

            amplitude = int(32767 * 0.3 * envelope * sample_val)
            amplitude = max(-32768, min(32767, amplitude))
            frames.extend(struct.pack("<h", amplitude))

        wav_file.writeframes(frames)

    return buffer.getvalue()


class SoundManager:
    """
    Gerenciador de áudio multiplataforma com timbres sintetizados puros.
    Garante que no Windows e outros SOs não seja acionado o som de alerta/erro do sistema.
    """

    def __init__(self, root_tk=None) -> None:
        self.root_tk = root_tk
        self.is_muted = False
        self.os_name = platform.system()
        self._wav_cache: Dict[str, bytes] = {}
        self._temp_files: Dict[str, str] = {}

        # Frequências e durações dos timbres sintetizados
        self._beep_presets = {
            "num": [(520, 25)],
            "enter": [(587, 40), (880, 50)],
            "op": [(659, 45)],
            "clear": [(330, 50)],
            "error": [(220, 60), (140, 70)],
        }

        # Gera buffers WAV para Linux e macOS
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
        """Reproduz o som de forma assíncrona em thread separada."""
        if self.is_muted:
            return

        threading.Thread(target=self._play_worker, args=(sound_type,), daemon=True).start()

    def _play_worker(self, sound_type: str) -> None:
        try:
            # 1. No Windows: Usa síntese pura de frequência com winsound.Beep
            # Isso emite o som musical puro sem jamais disparar o alerta/erro do Windows
            if winsound is not None:
                tones = self._beep_presets.get(sound_type, [(520, 25)])
                for freq, duration in tones:
                    winsound.Beep(freq, duration)
                return

            # 2. No macOS: Executa o WAV sintetizado via utilitário nativo afplay
            if self.os_name == "Darwin":
                temp_path = self._get_temp_wav(sound_type)
                if temp_path and os.path.exists(temp_path):
                    subprocess.run(["afplay", temp_path], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                    return

            # 3. No Linux: Tenta aplay (ALSA) ou paplay (PulseAudio/PipeWire)
            if self.os_name == "Linux":
                temp_path = self._get_temp_wav(sound_type)
                if temp_path and os.path.exists(temp_path):
                    for player in ["aplay", "paplay"]:
                        res = subprocess.run([player, "-q", temp_path], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                        if res.returncode == 0:
                            return
        except Exception:
            pass

    def _get_temp_wav(self, sound_type: str) -> Optional[str]:
        """Gera arquivo WAV temporário sob demanda para macOS e Linux."""
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
        """Remove arquivos temporários ao encerrar o aplicativo."""
        for path in self._temp_files.values():
            try:
                if os.path.exists(path):
                    os.remove(path)
            except Exception:
                pass

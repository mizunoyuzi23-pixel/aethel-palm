/**
 * Plays PCM audio data from a base64 string.
 * Gemini TTS returns 24000Hz mono PCM data.
 */
export async function playPCMAudio(base64Data: string, sampleRate = 24000) {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: sampleRate
    });
    
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    // PCM16 to Float32 conversion
    const pcm16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / 32768.0;
    }

    const audioBuffer = audioContext.createBuffer(1, float32.length, sampleRate);
    audioBuffer.getChannelData(0).set(float32);

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
    
    return {
      source,
      duration: audioBuffer.duration,
      onEnded: new Promise<void>((resolve) => {
        source.onended = () => {
          resolve();
          audioContext.close();
        };
      })
    };
  } catch (error) {
    console.error("Error playing PCM audio:", error);
    return null;
  }
}

let coinAudio: HTMLAudioElement | null = null

export function playCoinSound() {
  try {
    if (!coinAudio) {
      coinAudio = new Audio('/assets/magic_coin.mp3')
      coinAudio.preload = 'auto'
      coinAudio.volume = 0.6
    }
    // Reset to start for rapid presses
    coinAudio.currentTime = 0
    void coinAudio.play()
  } catch {
    // ignore
  }
}


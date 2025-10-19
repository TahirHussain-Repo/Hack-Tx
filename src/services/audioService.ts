// Audio Service for playing AI voice responses

class AudioService {
  private audio: HTMLAudioElement | null = null;
  private audioQueue: Blob[] = [];
  private isPlaying: boolean = false;

  /**
   * Play audio from a blob (from backend)
   */
  async play(audioBlob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Stop any currently playing audio
        this.stop();

        // Create audio URL from blob
        const audioUrl = URL.createObjectURL(audioBlob);
        this.audio = new Audio(audioUrl);

        this.audio.onended = () => {
          this.isPlaying = false;
          URL.revokeObjectURL(audioUrl);
          this.playNext(); // Play next in queue if exists
          resolve();
        };

        this.audio.onerror = (error) => {
          this.isPlaying = false;
          URL.revokeObjectURL(audioUrl);
          reject(error);
        };

        this.isPlaying = true;
        const playPromise = this.audio.play();
        // Handle autoplay/permission rejections to avoid unhandled promise rejection
        playPromise.catch((err) => {
          this.isPlaying = false;
          URL.revokeObjectURL(audioUrl);
          reject(err);
        });
      } catch (error) {
        console.error('Error playing audio:', error);
        reject(error);
      }
    });
  }

  /**
   * Add audio to queue
   */
  addToQueue(audioBlob: Blob): void {
    this.audioQueue.push(audioBlob);
    
    // If nothing is playing, start playing
    if (!this.isPlaying) {
      this.playNext();
    }
  }

  /**
   * Play next audio in queue
   */
  private async playNext(): Promise<void> {
    if (this.audioQueue.length > 0) {
      const nextAudio = this.audioQueue.shift();
      if (nextAudio) {
        await this.play(nextAudio);
      }
    }
  }

  /**
   * Stop current audio playback
   */
  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }
    this.isPlaying = false;
  }

  /**
   * Clear the audio queue
   */
  clearQueue(): void {
    this.audioQueue = [];
  }

  /**
   * Pause current audio
   */
  pause(): void {
    if (this.audio) {
      this.audio.pause();
      this.isPlaying = false;
    }
  }

  /**
   * Resume paused audio
   */
  resume(): void {
    if (this.audio) {
      this.audio.play();
      this.isPlaying = true;
    }
  }

  /**
   * Check if audio is currently playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Get queue length
   */
  getQueueLength(): number {
    return this.audioQueue.length;
  }
}

// Export singleton instance
export const audioService = new AudioService();


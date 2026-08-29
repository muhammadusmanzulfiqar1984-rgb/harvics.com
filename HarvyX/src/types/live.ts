/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LiveConfig {
  model: string;
  systemInstruction?: string;
}

export interface AudioProcessingConfig {
  sampleRate: number;
  chunkSize: number;
}

export const DEFAULT_AUDIO_CONFIG: AudioProcessingConfig = {
  sampleRate: 16000,
  chunkSize: 4096,
};

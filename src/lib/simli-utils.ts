
/**
 * Converts a base64 encoded PCM audio string into an Int16Array.
 * Expected input format: 'data:audio/pcm;base64,...'
 */
export function base64PcmToInt16Array(base64DataUri: string): Int16Array {
  const base64String = base64DataUri.split(',')[1];
  const binaryString = window.atob(base64String);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  // PCM is 16-bit, so 2 bytes per sample
  return new Int16Array(bytes.buffer);
}

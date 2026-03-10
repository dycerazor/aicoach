'use server';
/**
 * @fileOverview This file implements a Genkit flow for real-time AI coaching.
 * It orchestrates a conversational turn by receiving user text, generating an AI response
 * using a Gemini LLM, converting the AI's text response to speech using Gemini TTS,
 * and resampling the audio to 16kHz PCM format required by the Simli client.
 *
 * - talkToCoach - The main function to initiate a coaching conversational turn.
 * - ConversationTurnInput - The input type for the talkToCoach function.
 * - ConversationTurnOutput - The return type for the talkToCoach function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Zod schema for the input of a single conversational turn.
 * Assumes user audio input has already been transcribed to text.
 */
const ConversationTurnInputSchema = z.object({
  userInputText: z.string().describe("The user's spoken input transcribed into text."),
  conversationHistory: z.array(
    z.object({ role: z.enum(['user', 'model']), content: z.string() })
  ).optional().describe("Previous turns of the conversation for context."),
});
export type ConversationTurnInput = z.infer<typeof ConversationTurnInputSchema>;

/**
 * Zod schema for the output of a single conversational turn.
 */
const ConversationTurnOutputSchema = z.object({
  aiResponseAudioUri: z.string().describe("The AI's spoken response as a 16kHz PCM audio data URI, base64 encoded."),
  aiResponseText: z.string().describe("The AI's spoken response transcribed into text."),
});
export type ConversationTurnOutput = z.infer<typeof ConversationTurnOutputSchema>;

/**
 * Resamples 16-bit signed little-endian PCM audio data from 24kHz to 16kHz
 * using linear interpolation. This is a simplified resampling for demonstration purposes.
 *
 * @param inputBuffer The Buffer containing the 24kHz PCM audio data.
 * @returns A Buffer containing the 16kHz PCM audio data.
 */
function resamplePcm24To16(inputBuffer: Buffer): Buffer {
  const inputSampleRate = 24000;
  const outputSampleRate = 16000;
  const bytesPerSample = 2; // 16-bit PCM

  const inputSamples = inputBuffer.length / bytesPerSample;
  const outputSamples = Math.floor(inputSamples * (outputSampleRate / inputSampleRate));
  const outputBuffer = Buffer.alloc(outputSamples * bytesPerSample);

  for (let i = 0; i < outputSamples; i++) {
    // Calculate the corresponding index in the input buffer
    // current_output_sample_index * (input_sample_rate / output_sample_rate)
    const inputIndexFloat = i * (inputSampleRate / outputSampleRate);

    // Perform linear interpolation
    const idx1 = Math.floor(inputIndexFloat);
    const idx2 = Math.ceil(inputIndexFloat);
    const fraction = inputIndexFloat - idx1;

    let sample1 = 0;
    let sample2 = 0;

    if (idx1 * bytesPerSample < inputBuffer.length) {
      sample1 = inputBuffer.readInt16LE(idx1 * bytesPerSample);
    }

    // Handle edge case where idx2 might be out of bounds
    if (idx2 * bytesPerSample < inputBuffer.length) {
      sample2 = inputBuffer.readInt16LE(idx2 * bytesPerSample);
    } else {
      // If idx2 is out of bounds, use sample1 for interpolation
      sample2 = sample1;
    }

    const interpolatedSample = Math.round(sample1 * (1 - fraction) + sample2 * fraction);

    // Ensure the sample fits within 16-bit signed integer range
    const clampedSample = Math.max(-32768, Math.min(32767, interpolatedSample));

    // Write the interpolated sample to the output buffer
    outputBuffer.writeInt16LE(clampedSample, i * bytesPerSample);
  }
  return outputBuffer;
}

const realtimeAiCoachingFlow = ai.defineFlow(
  {
    name: 'realtimeAiCoachingFlow',
    inputSchema: ConversationTurnInputSchema,
    outputSchema: ConversationTurnOutputSchema,
  },
  async (input) => {
    // Prepare messages for the LLM, including history and current user input
    const messages = [
      ...(input.conversationHistory || []).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: input.userInputText },
    ];

    // Generate a text response using a Gemini LLM
    const { output: llmResponse } = await ai.generate({
      model: googleAI.model('gemini-1.5-flash'), // Using gemini-1.5-flash for responsiveness
      prompt: messages,
      config: {
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        ],
      },
    });
    const aiResponseText = llmResponse.text();

    // Convert the AI's text response to speech using Gemini TTS
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' }, // A natural-sounding voice
          },
        },
      },
      prompt: aiResponseText,
    });

    if (!media || !media.url) {
      throw new Error('No audio media returned from Gemini TTS.');
    }

    // Extract the raw PCM audio buffer (24kHz) from the data URI
    const ttsAudioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    // Resample the 24kHz PCM audio to 16kHz PCM
    const resampledAudioBuffer = resamplePcm24To16(ttsAudioBuffer);
    const resampledAudioBase64 = resampledAudioBuffer.toString('base64');

    return {
      aiResponseAudioUri: `data:audio/pcm;base64,${resampledAudioBase64}`,
      aiResponseText: aiResponseText,
    };
  }
);

/**
 * Initiates a single conversational turn with the AI coach.
 * Takes user's transcribed text and conversation history, and returns
 * the AI's spoken response (16kHz PCM audio) and its text.
 *
 * @param input The input for the conversational turn.
 * @returns The AI's response audio and text.
 */
export async function talkToCoach(input: ConversationTurnInput): Promise<ConversationTurnOutput> {
  return realtimeAiCoachingFlow(input);
}

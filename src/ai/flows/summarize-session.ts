'use server';
/**
 * @fileOverview This file implements a Genkit flow for summarizing coaching sessions.
 * It takes the conversation history and generates a concise, insightful summary.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const SummarizeSessionInputSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'ai']),
      content: z.string(),
    })
  ).describe("The messages exchanged during the coaching session."),
});
export type SummarizeSessionInput = z.infer<typeof SummarizeSessionInputSchema>;

const SummarizeSessionOutputSchema = z.object({
  summary: z.string().describe("A brief, insightful summary of the coaching session's key takeaways."),
});
export type SummarizeSessionOutput = z.infer<typeof SummarizeSessionOutputSchema>;

const summarizeSessionFlow = ai.defineFlow(
  {
    name: 'summarizeSessionFlow',
    inputSchema: SummarizeSessionInputSchema,
    outputSchema: SummarizeSessionOutputSchema,
  },
  async (input) => {
    const prompt = `You are an AI coaching assistant. Please provide a concise summary (2-3 sentences) of the following coaching conversation. Focus on the user's goals and the advice provided.

Conversation:
${input.messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

Summary:`;

    const { output } = await ai.generate({
      model: googleAI.model('gemini-1.5-flash'),
      prompt,
    });

    return {
      summary: output.text() || "No summary available for this session.",
    };
  }
);

/**
 * Generates a summary for a coaching session based on its messages.
 */
export async function summarizeSession(input: SummarizeSessionInput): Promise<SummarizeSessionOutput> {
  return summarizeSessionFlow(input);
}

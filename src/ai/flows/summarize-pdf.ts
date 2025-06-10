'use server';

/**
 * @fileOverview This file defines a Genkit flow for summarizing PDF content into bullet points and flashcards.
 *
 * - summarizePdf - A function that handles the PDF summarization process.
 * - SummarizePdfInput - The input type for the summarizePdf function.
 * - SummarizePdfOutput - The return type for the summarizePdf function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizePdfInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF document as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SummarizePdfInput = z.infer<typeof SummarizePdfInputSchema>;

const SummarizePdfOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the PDF content in bullet points.'),
  flashcards: z.string().describe('Key concepts from the PDF formatted as flashcards (question and answer pairs).'),
});
export type SummarizePdfOutput = z.infer<typeof SummarizePdfOutputSchema>;

export async function summarizePdf(input: SummarizePdfInput): Promise<SummarizePdfOutput> {
  return summarizePdfFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizePdfPrompt',
  input: {schema: SummarizePdfInputSchema},
  output: {schema: SummarizePdfOutputSchema},
  prompt: `You are an expert summarizer, skilled at extracting key information from documents.

You will receive a PDF document as input. Your task is to:

1.  Summarize the content of the PDF into concise bullet points.
2.  Identify key concepts and formulate them as flashcards in a question and answer format.

PDF Document: {{media url=pdfDataUri}}

Summary (Bullet Points):

Flashcards (Question & Answer):
`,
});

const summarizePdfFlow = ai.defineFlow(
  {
    name: 'summarizePdfFlow',
    inputSchema: SummarizePdfInputSchema,
    outputSchema: SummarizePdfOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

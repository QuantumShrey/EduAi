// src/ai/flows/generate-quiz.ts
'use server';
/**
 * @fileOverview A quiz generation AI agent.
 *
 * - generateQuiz - A function that handles the quiz generation process.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizInputSchema = z.object({
  pdfContent: z.string().describe('The content of the PDF to generate a quiz from.'),
  numQuestions: z.number().describe('The number of questions to generate.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
  quiz: z.array(
    z.object({
      question: z.string().describe('The question text.'),
      options: z.array(z.string()).describe('The possible answer options.'),
      correctAnswerIndex: z.number().describe('The index of the correct answer in the options array.'),
    })
  ).describe('The generated quiz questions.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are an expert quiz generator. You will generate a multiple-choice quiz from the provided PDF content.  The quiz should have the specified number of questions.

PDF Content: {{{pdfContent}}}
Number of Questions: {{{numQuestions}}}

Ensure that the correctAnswerIndex is a valid index within the options array for each question.

Output a JSON object that satisfies the following schema:
\n{{{outputSchema}}}`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

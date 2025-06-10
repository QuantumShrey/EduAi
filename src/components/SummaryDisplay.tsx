"use client";

import type { SummarizePdfOutput } from '@/ai/flows/summarize-pdf';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Flashcard } from '@/components/Flashcard';
import { ListChecks, Copy, AlertCircle } from 'lucide-react';
import * as React from 'react';

interface SummaryDisplayProps {
  summaryData: SummarizePdfOutput | null;
}

interface ParsedFlashcard {
  question: string;
  answer: string;
}

const parseFlashcardsString = (flashcardsStr: string): ParsedFlashcard[] => {
  if (!flashcardsStr || typeof flashcardsStr !== 'string') {
    return [];
  }
  const cards: ParsedFlashcard[] = [];
  // Regex to find Q: and A: pairs, handling multiline answers
  const regex = /Q:\s*(.*?)\s*A:\s*((?:.|\n)*?)(?=\nQ:|\s*$)/g;
  let match;
  while ((match = regex.exec(flashcardsStr)) !== null) {
    cards.push({ question: match[1].trim(), answer: match[2].trim() });
  }
  // Fallback if regex doesn't match, try splitting by double newlines
  if (cards.length === 0 && flashcardsStr.includes('\n\n')) {
     const pairs = flashcardsStr.split(/\n\n+/);
     pairs.forEach(pair => {
        const qIndex = pair.toLowerCase().indexOf("q:");
        const aIndex = pair.toLowerCase().indexOf("a:");
        if (qIndex !== -1 && aIndex !== -1 && aIndex > qIndex) {
            const question = pair.substring(qIndex + 2, aIndex).trim();
            const answer = pair.substring(aIndex + 2).trim();
            if (question && answer) {
                cards.push({ question, answer });
            }
        }
     });
  }
  return cards;
};


export function SummaryDisplay({ summaryData }: SummaryDisplayProps) {
  const [parsedFlashcards, setParsedFlashcards] = React.useState<ParsedFlashcard[]>([]);

  React.useEffect(() => {
    if (summaryData?.flashcards) {
      setParsedFlashcards(parseFlashcardsString(summaryData.flashcards));
    } else {
      setParsedFlashcards([]);
    }
  }, [summaryData]);

  if (!summaryData) {
    return null;
  }

  const summaryPoints = summaryData.summary
    .split('\n')
    .map(line => line.trim().replace(/^- /, '').replace(/^\* /, ''))
    .filter(line => line.length > 0);

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center font-headline">
            <ListChecks className="mr-2 h-6 w-6 text-primary" />
            Key Summary Points
          </CardTitle>
          <CardDescription>
            Concise bullet points highlighting the main topics from the PDF.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summaryPoints.length > 0 ? (
            <ul className="list-disc space-y-2 pl-5 text-sm">
              {summaryPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">No summary points available.</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center font-headline">
            <Copy className="mr-2 h-6 w-6 text-primary" />
            Flashcards
          </CardTitle>
          <CardDescription>
            Review key concepts with these auto-generated flashcards. Click to flip.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {parsedFlashcards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {parsedFlashcards.map((fc, index) => (
                <Flashcard key={index} question={fc.question} answer={fc.answer} />
              ))}
            </div>
          ) : (
             summaryData.flashcards && summaryData.flashcards.trim() !== "" ? (
              <div className="text-muted-foreground text-sm flex items-center">
                <AlertCircle className="mr-2 h-4 w-4" />
                Could not parse flashcards. Raw content:
                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto whitespace-pre-wrap">{summaryData.flashcards}</pre>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No flashcards generated or available.</p>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}

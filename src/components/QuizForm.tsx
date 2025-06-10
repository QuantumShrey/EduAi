"use client";

import * as React from 'react';
import { generateQuiz, type GenerateQuizInput } from '@/ai/flows/generate-quiz';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, HelpCircle, AlertTriangle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuizFormProps {
  pdfSummaryText: string | null;
  onQuizGenerated: (quizData: Awaited<ReturnType<typeof generateQuiz>>) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function QuizForm({ pdfSummaryText, onQuizGenerated, isLoading, setIsLoading }: QuizFormProps) {
  const [numQuestions, setNumQuestions] = React.useState<string>("5");
  const [formError, setFormError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateQuiz = async () => {
    if (!pdfSummaryText) {
      setFormError('No summary available to generate a quiz from.');
      toast({
        title: "Missing Summary",
        description: "Cannot generate quiz without PDF summary.",
        variant: "destructive",
      });
      return;
    }

    const questionCount = parseInt(numQuestions, 10);
    if (isNaN(questionCount) || questionCount <= 0 || questionCount > 20) {
      setFormError('Please enter a valid number of questions (1-20).');
      toast({
        title: "Invalid Input",
        description: "Number of questions must be between 1 and 20.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setFormError(null);

    try {
      const input: GenerateQuizInput = {
        pdfContent: pdfSummaryText, // Using summary text as "pdfContent"
        numQuestions: questionCount,
      };
      const quizResult = await generateQuiz(input);
      onQuizGenerated(quizResult);
      toast({
        title: "Quiz Generated",
        description: `A quiz with ${questionCount} questions has been created.`,
      });
    } catch (error) {
      console.error('Quiz generation error:', error);
      let errorMessage = 'An unknown error occurred during quiz generation.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setFormError(errorMessage);
      toast({
        title: "Quiz Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center font-headline">
          <HelpCircle className="mr-2 h-6 w-6 text-primary" />
          Generate Quiz
        </CardTitle>
        <CardDescription>
          Create a multiple-choice quiz based on the summarized PDF content to test your understanding.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="num-questions" className="text-sm font-medium">Number of Questions</Label>
           <Select value={numQuestions} onValueChange={setNumQuestions} disabled={isLoading || !pdfSummaryText}>
            <SelectTrigger id="num-questions" className="w-full mt-1">
              <SelectValue placeholder="Select number of questions" />
            </SelectTrigger>
            <SelectContent>
              {[3, 5, 10, 15, 20].map(num => (
                 <SelectItem key={num} value={String(num)}>{num} Questions</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {formError && (
          <p className="text-sm text-destructive flex items-center">
            <AlertTriangle className="mr-1 h-4 w-4" />
            {formError}
          </p>
        )}
        <Button onClick={handleGenerateQuiz} disabled={isLoading || !pdfSummaryText} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
             <HelpCircle className="mr-2 h-4 w-4" />
          )}
          Generate Quiz
        </Button>
         {!pdfSummaryText && (
          <p className="text-xs text-muted-foreground text-center">Upload and summarize a PDF first to enable quiz generation.</p>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import * as React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { FileUpload } from '@/components/FileUpload';
import { SummaryDisplay } from '@/components/SummaryDisplay';
import { QuizForm } from '@/components/QuizForm';
import { QuizDisplay } from '@/components/QuizDisplay';
import type { SummarizePdfOutput } from '@/ai/flows/summarize-pdf';
import type { GenerateQuizOutput } from '@/ai/flows/generate-quiz';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';

export default function EduAIDashboardPage() {
  const [summaryData, setSummaryData] = React.useState<SummarizePdfOutput | null>(null);
  const [pdfTextForQuiz, setPdfTextForQuiz] = React.useState<string | null>(null);
  const [quizData, setQuizData] = React.useState<GenerateQuizOutput | null>(null);
  
  const [isSummarizing, setIsSummarizing] = React.useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = React.useState(false);
  
  const [globalError, setGlobalError] = React.useState<string | null>(null);

  const handleSummaryComplete = (newSummaryData: SummarizePdfOutput, newPdfTextContent: string) => {
    setSummaryData(newSummaryData);
    setPdfTextForQuiz(newPdfTextContent);
    setQuizData(null); // Reset quiz data when new summary is generated
    setIsSummarizing(false);
    setGlobalError(null);
  };

  const handleQuizGenerated = (newQuizData: GenerateQuizOutput) => {
    setQuizData(newQuizData);
    setIsGeneratingQuiz(false);
    setGlobalError(null);
  };

  const handleRetakeQuiz = () => {
    // Option 1: Simply reset the quiz display to allow retake of the same questions
    setQuizData(prev => prev ? { ...prev, timestamp: Date.now() } : null); // Force re-render of QuizDisplay
    // Option 2: Re-generate the quiz (if desired, requires calling QuizForm logic again)
    // For now, let's stick to retaking the same quiz.
    // If QuizForm's handleGenerateQuiz is to be called, we need to ensure pdfTextForQuiz is still valid.
  }

  return (
    <div className="flex flex-col min-h-screen">
      <style jsx global>{`
        .perspective {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden; /* Safari */
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 space-y-8">
        {globalError && (
          <Alert variant="destructive" className="shadow-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>An Error Occurred</AlertTitle>
            <AlertDescription>{globalError}</AlertDescription>
          </Alert>
        )}

        <FileUpload 
          onSummaryComplete={handleSummaryComplete} 
          isLoading={isSummarizing}
          setIsLoading={setIsSummarizing}
        />

        {isSummarizing && (
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-lg shadow-lg" />
            <Skeleton className="h-64 w-full rounded-lg shadow-lg" />
          </div>
        )}

        {summaryData && !isSummarizing && (
          <SummaryDisplay summaryData={summaryData} />
        )}

        {summaryData && !isSummarizing && (
           <QuizForm
            pdfSummaryText={pdfTextForQuiz}
            onQuizGenerated={handleQuizGenerated}
            isLoading={isGeneratingQuiz}
            setIsLoading={setIsGeneratingQuiz}
          />
        )}
        
        {isGeneratingQuiz && (
           <Skeleton className="h-96 w-full rounded-lg shadow-lg" />
        )}

        {quizData && !isGeneratingQuiz && (
          <QuizDisplay quizData={quizData} onRetakeQuiz={handleRetakeQuiz} />
        )}
        
        {!summaryData && !isSummarizing && (
            <div className="text-center py-12">
                <img src="https://placehold.co/300x200.png" alt="Placeholder" data-ai-hint="education study" className="mx-auto mb-6 rounded-lg shadow-md" />
                <h2 className="text-2xl font-semibold text-gray-700 mb-2 font-headline">Welcome to EduAI!</h2>
                <p className="text-gray-500">Upload a PDF to get started with AI-powered summaries, flashcards, and quizzes.</p>
            </div>
        )}

      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} EduAI. Empowering your learning journey.
      </footer>
    </div>
  );
}

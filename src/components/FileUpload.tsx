"use client";

import * as React from 'react';
import { summarizePdf, type SummarizePdfInput } from '@/ai/flows/summarize-pdf';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileUp, AlertTriangle } from 'lucide-react';

interface FileUploadProps {
  onSummaryComplete: (summaryData: Awaited<ReturnType<typeof summarizePdf>>, pdfTextContent: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function FileUpload({ onSummaryComplete, isLoading, setIsLoading }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [fileError, setFileError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        setFileError(null);
      } else {
        setSelectedFile(null);
        setFileError('Please select a PDF file.');
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF file.",
          variant: "destructive",
        });
      }
    }
  };

  // Basic text extraction from PDF (client-side, very simplified)
  // For robust extraction, a library like pdf.js would be needed.
  // This is a placeholder and might not work for all PDFs or complex layouts.
  const extractTextFromPdf = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
          // This is a very naive way to check for text.
          // A real PDF parser is needed for proper text extraction.
          // For now, we'll simulate this by assuming the Genkit flow handles it or by using summary.
          // For the purpose of generateQuiz which needs text, we will use summary text.
          // This function is more of a placeholder for future, more robust text extraction.
          const text = new TextDecoder().decode(typedArray).substring(0, 5000); // Limit length
          resolve(text); 
        } catch (error) {
          console.error("Error reading PDF for text extraction:", error);
          reject("Could not read text from PDF.");
        }
      };
      reader.onerror = (e) => {
        reject("Failed to read file.");
      };
      reader.readAsArrayBuffer(file);
    });
  };


  const handleSubmit = async () => {
    if (!selectedFile) {
      setFileError('Please select a file first.');
      toast({
        title: "No File Selected",
        description: "Please select a PDF file to summarize.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setFileError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = async () => {
        const pdfDataUri = reader.result as string;
        const input: SummarizePdfInput = { pdfDataUri };
        
        const summaryResult = await summarizePdf(input);
        
        // For generateQuiz, we will use the summary text.
        // A more robust solution would extract full text from PDF.
        const pdfTextForQuiz = summaryResult.summary; 

        onSummaryComplete(summaryResult, pdfTextForQuiz);
        toast({
          title: "Summarization Complete",
          description: "PDF has been summarized successfully.",
        });
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        setFileError('Error reading file.');
        toast({
          title: "File Read Error",
          description: "Could not read the selected PDF file.",
          variant: "destructive",
        });
        setIsLoading(false);
      };
    } catch (error) {
      console.error('Summarization error:', error);
      let errorMessage = 'An unknown error occurred during summarization.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setFileError(errorMessage);
      toast({
        title: "Summarization Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center font-headline">
          <FileUp className="mr-2 h-6 w-6 text-primary" />
          Upload PDF for Analysis
        </CardTitle>
        <CardDescription>
          Select a PDF from your learning materials to get an AI-powered summary, flashcards, and a quiz.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="pdf-upload" className="text-sm font-medium">Choose PDF File</Label>
          <Input
            id="pdf-upload"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            disabled={isLoading}
          />
        </div>
        {fileError && (
          <p className="text-sm text-destructive flex items-center">
            <AlertTriangle className="mr-1 h-4 w-4" />
            {fileError}
          </p>
        )}
        <Button onClick={handleSubmit} disabled={isLoading || !selectedFile} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileUp className="mr-2 h-4 w-4" />
          )}
          Summarize & Analyze PDF
        </Button>
      </CardContent>
    </Card>
  );
}

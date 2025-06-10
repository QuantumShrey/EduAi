"use client";

import * as React from 'react';
import type { GenerateQuizOutput } from '@/ai/flows/generate-quiz';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Lightbulb, RotateCcw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface QuizDisplayProps {
  quizData: GenerateQuizOutput | null;
  onRetakeQuiz: () => void;
}

interface Answer {
  questionIndex: number;
  selectedOptionIndex: number;
}

export function QuizDisplay({ quizData, onRetakeQuiz }: QuizDisplayProps) {
  const [answers, setAnswers] = React.useState<Answer[]>([]);
  const [submitted, setSubmitted] = React.useState(false);
  const [score, setScore] = React.useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);

  React.useEffect(() => {
    // Reset state when new quiz data comes in
    setAnswers([]);
    setSubmitted(false);
    setScore(0);
    setCurrentQuestionIndex(0);
  }, [quizData]);

  if (!quizData || !quizData.quiz || quizData.quiz.length === 0) {
    return null;
  }

  const { quiz } = quizData;
  const totalQuestions = quiz.length;
  const currentQuestion = quiz[currentQuestionIndex];

  const handleOptionChange = (questionIndex: number, selectedOptionIndex: number) => {
    setAnswers(prevAnswers => {
      const existingAnswerIndex = prevAnswers.findIndex(a => a.questionIndex === questionIndex);
      if (existingAnswerIndex > -1) {
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[existingAnswerIndex] = { questionIndex, selectedOptionIndex };
        return updatedAnswers;
      }
      return [...prevAnswers, { questionIndex, selectedOptionIndex }];
    });
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    let currentScore = 0;
    quiz.forEach((q, qIndex) => {
      const userAnswer = answers.find(a => a.questionIndex === qIndex);
      if (userAnswer && userAnswer.selectedOptionIndex === q.correctAnswerIndex) {
        currentScore++;
      }
    });
    setScore(currentScore);
    setSubmitted(true);
  };

  const handleRetake = () => {
    setAnswers([]);
    setSubmitted(false);
    setScore(0);
    setCurrentQuestionIndex(0);
    onRetakeQuiz(); // This could potentially trigger a new quiz generation
  };

  const progressPercentage = ((currentQuestionIndex +1 ) / totalQuestions) * 100;


  if (submitted) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center font-headline">
            <CheckCircle2 className="mr-2 h-6 w-6 text-green-500" />
            Quiz Results
          </CardTitle>
          <CardDescription>You scored {score} out of {totalQuestions}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {quiz.map((q, qIndex) => {
            const userAnswer = answers.find(a => a.questionIndex === qIndex);
            const isCorrect = userAnswer && userAnswer.selectedOptionIndex === q.correctAnswerIndex;
            return (
              <div key={qIndex} className="p-4 border rounded-md bg-card">
                <p className="font-semibold">{qIndex + 1}. {q.question}</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {q.options.map((option, oIndex) => (
                    <li
                      key={oIndex}
                      className={`flex items-center p-2 rounded ${
                        oIndex === q.correctAnswerIndex ? 'bg-green-100 text-green-700' : 
                        (userAnswer && userAnswer.selectedOptionIndex === oIndex && !isCorrect ? 'bg-red-100 text-red-700' : 'bg-muted/30')
                      }`}
                    >
                      {oIndex === q.correctAnswerIndex && <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />}
                      {userAnswer && userAnswer.selectedOptionIndex === oIndex && !isCorrect && <XCircle className="mr-2 h-4 w-4 text-red-500" />}
                      {option}
                      {userAnswer && userAnswer.selectedOptionIndex === oIndex && <span> (Your answer)</span>}
                    </li>
                  ))}
                </ul>
                {!isCorrect && userAnswer && (
                  <p className="mt-2 text-xs text-green-600">Correct answer: {q.options[q.correctAnswerIndex]}</p>
                )}
              </div>
            );
          })}
          <Button onClick={handleRetake} className="w-full mt-6 bg-primary hover:bg-primary/90">
            <RotateCcw className="mr-2 h-4 w-4" /> Retake Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center font-headline">
          <Lightbulb className="mr-2 h-6 w-6 text-primary" />
          Test Your Knowledge
        </CardTitle>
        <CardDescription>
          Question {currentQuestionIndex + 1} of {totalQuestions}. Answer the questions below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Progress value={progressPercentage} className="w-full" />
        <div key={currentQuestionIndex} className="p-4 border rounded-md bg-card shadow-sm">
          <p className="font-semibold text-lg mb-4">{currentQuestionIndex + 1}. {currentQuestion.question}</p>
          <RadioGroup
            onValueChange={(value) => handleOptionChange(currentQuestionIndex, parseInt(value))}
            value={answers.find(a => a.questionIndex === currentQuestionIndex)?.selectedOptionIndex.toString()}
            className="space-y-2"
          >
            {currentQuestion.options.map((option, oIndex) => (
              <div key={oIndex} className="flex items-center space-x-2 p-3 rounded-md hover:bg-muted/50 transition-colors border">
                <RadioGroupItem value={String(oIndex)} id={`q${currentQuestionIndex}-o${oIndex}`} />
                <Label htmlFor={`q${currentQuestionIndex}-o${oIndex}`} className="flex-1 cursor-pointer text-sm">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <Separator />
        <div className="flex justify-end">
          <Button 
            onClick={handleNextQuestion} 
            disabled={answers.find(a => a.questionIndex === currentQuestionIndex) === undefined}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Submit Answers'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

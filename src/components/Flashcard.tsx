"use client";

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FlashcardProps {
  question: string;
  answer: string;
}

export function Flashcard({ question, answer }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = React.useState(false);

  return (
    <div
      className="perspective w-full h-48 cursor-pointer group"
      onClick={() => setIsFlipped(!isFlipped)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsFlipped(!isFlipped)}
      aria-pressed={isFlipped}
      aria-label={`Flashcard: Question - ${question}. Click to see answer.`}
    >
      <Card
        className={cn(
          "relative w-full h-full transform-style-preserve-3d transition-transform duration-700 ease-in-out shadow-md",
          isFlipped ? 'rotate-y-180' : ''
        )}
      >
        {/* Front of the card (Question) */}
        <CardContent className="absolute w-full h-full backface-hidden flex flex-col items-center justify-center p-4 bg-card rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Question</p>
          <p className="text-center font-semibold text-card-foreground">{question}</p>
        </CardContent>

        {/* Back of the card (Answer) */}
        <CardContent className="absolute w-full h-full backface-hidden rotate-y-180 flex flex-col items-center justify-center p-4 bg-secondary rounded-lg">
           <p className="text-xs text-secondary-foreground/80 mb-1">Answer</p>
          <p className="text-center text-secondary-foreground">{answer}</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Add these styles to your globals.css or a relevant CSS file for 3D transform
/*
.perspective {
  perspective: 1000px;
}
.transform-style-preserve-3d {
  transform-style: preserve-3d;
}
.backface-hidden {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.rotate-y-180 {
  transform: rotateY(180deg);
}
*/
// The above CSS has been added to page.tsx's style block for simplicity as globals.css cannot be modified directly for this property.

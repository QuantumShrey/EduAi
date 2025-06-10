import Link from 'next/link';
import { EduAiLogo } from '@/components/icons/EduAiLogo';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center space-x-2">
          <EduAiLogo className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl font-headline">EduAI</span>
        </Link>
        {/* Add nav items here if needed */}
      </div>
    </header>
  );
}

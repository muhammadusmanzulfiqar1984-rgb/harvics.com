import React from 'react';
import TerminalTest from '@/components/intelligence/TerminalTest';

export default function TestPage() {
  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <h1 className="text-harvics-burgundy font-bold tracking-widest text-lg mb-8 uppercase">
          System Diagnostic Sandbox
        </h1>
        <TerminalTest />
      </div>
    </div>
  );
}

import React from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  className?: string;
  mbClass?: string;
}

export default function PageHeader({ 
  eyebrow, 
  title, 
  description, 
  className = '', 
  mbClass = 'mb-16' 
}: PageHeaderProps) {
  return (
    <div className={`text-center max-w-3xl mx-auto space-y-4 ${mbClass} ${className}`}>
      {eyebrow && (
        <h1 className="text-xs font-bold text-[#00A3FF] uppercase tracking-widest font-mono">
          {eyebrow}
        </h1>
      )}
      <h2 className="text-3xl font-black text-gray-900 tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed whitespace-pre-line break-keep">
          {description}
        </p>
      )}
    </div>
  );
}

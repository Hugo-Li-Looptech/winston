import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Slide } from '@/types/course';

interface SlideDetailsPanelProps {
  slide: Slide;
}

export function SlideDetailsPanel({ slide }: SlideDetailsPanelProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['summary']);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const isExpanded = (section: string) => expandedSections.includes(section);

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
      {/* Keywords Section */}
      <button
        onClick={() => toggleSection('keywords')}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
      >
        <span className="text-sm font-medium text-foreground">Extracted Keywords</span>
        {isExpanded('keywords') ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isExpanded('keywords') && (
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {slide.keywords.map((keyword, index) => (
              <span
                key={index}
                className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-full"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="border-t" />

      {/* Summary Section */}
      <button
        onClick={() => toggleSection('summary')}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
      >
        <span className="text-sm font-medium text-foreground">Auto-Summary</span>
        {isExpanded('summary') ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isExpanded('summary') && (
        <div className="px-4 pb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {slide.summary}
          </p>
        </div>
      )}

      <div className="border-t" />

      {/* Structural Elements Section */}
      <button
        onClick={() => toggleSection('structure')}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
      >
        <span className="text-sm font-medium text-foreground">Structural Elements</span>
        {isExpanded('structure') ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isExpanded('structure') && (
        <div className="px-4 pb-4">
          <ul className="space-y-1.5">
            {slide.content.map((item, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

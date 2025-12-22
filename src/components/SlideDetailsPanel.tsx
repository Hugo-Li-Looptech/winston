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
    <div className="space-y-2">
      {/* Keywords Section */}
      <div className="bg-muted/30 dark:bg-muted/20 rounded-xl overflow-hidden transition-all duration-300 hover:bg-muted/40 dark:hover:bg-muted/30">
        <button
          onClick={() => toggleSection('keywords')}
          className="w-full flex items-center justify-between p-4 transition-colors duration-200 text-left group"
        >
          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200">Extracted Keywords</span>
          {isExpanded('keywords') ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform duration-200" />
          )}
        </button>
        <div className={`grid transition-all duration-300 ease-out ${isExpanded('keywords') ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="overflow-hidden">
            <div className="px-4 pb-4">
              <div className="flex flex-wrap gap-2">
                {slide.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-full transition-all duration-200 hover:bg-primary/20 hover:scale-105 cursor-default"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-muted/30 dark:bg-muted/20 rounded-xl overflow-hidden transition-all duration-300 hover:bg-muted/40 dark:hover:bg-muted/30">
        <button
          onClick={() => toggleSection('summary')}
          className="w-full flex items-center justify-between p-4 transition-colors duration-200 text-left group"
        >
          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200">Auto-Summary</span>
          {isExpanded('summary') ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform duration-200" />
          )}
        </button>
        <div className={`grid transition-all duration-300 ease-out ${isExpanded('summary') ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="overflow-hidden">
            <div className="px-4 pb-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {slide.summary}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Structural Elements Section */}
      <div className="bg-muted/30 dark:bg-muted/20 rounded-xl overflow-hidden transition-all duration-300 hover:bg-muted/40 dark:hover:bg-muted/30">
        <button
          onClick={() => toggleSection('structure')}
          className="w-full flex items-center justify-between p-4 transition-colors duration-200 text-left group"
        >
          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200">Structural Elements</span>
          {isExpanded('structure') ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform duration-200" />
          )}
        </button>
        <div className={`grid transition-all duration-300 ease-out ${isExpanded('structure') ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="overflow-hidden">
            <div className="px-4 pb-4">
              <ul className="space-y-1.5">
                {slide.content.map((item, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2 transition-colors duration-200 hover:text-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-1.5 shrink-0 transition-colors duration-200" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

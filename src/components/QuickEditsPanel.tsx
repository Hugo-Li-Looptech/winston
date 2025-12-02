import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles } from 'lucide-react';

interface QuickEditsPanelProps {
  isVerbose: boolean;
  isStreamlined: boolean;
  onVerboseChange: (checked: boolean) => void;
  onStreamlinedChange: (checked: boolean) => void;
  onAskWinston: () => void;
}

export function QuickEditsPanel({
  isVerbose,
  isStreamlined,
  onVerboseChange,
  onStreamlinedChange,
  onAskWinston,
}: QuickEditsPanelProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-foreground">Quick Edits</h4>
      
      <Button 
        onClick={onAskWinston}
        className="w-full rounded-xl gap-2 justify-start"
        variant="default"
      >
        <Sparkles className="h-4 w-4" />
        Ask Winston
      </Button>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Checkbox 
            id="verbose" 
            checked={isVerbose}
            onCheckedChange={(checked) => onVerboseChange(checked as boolean)}
          />
          <label 
            htmlFor="verbose" 
            className="text-sm text-foreground cursor-pointer"
          >
            More Verbose
          </label>
        </div>
        
        <div className="flex items-center gap-3">
          <Checkbox 
            id="streamlined" 
            checked={isStreamlined}
            onCheckedChange={(checked) => onStreamlinedChange(checked as boolean)}
          />
          <label 
            htmlFor="streamlined" 
            className="text-sm text-foreground cursor-pointer"
          >
            More Streamlined
          </label>
        </div>
      </div>
    </div>
  );
}

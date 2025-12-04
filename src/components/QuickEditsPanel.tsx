import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, Play, X } from 'lucide-react';

interface QuickEditsPanelProps {
  isVerbose: boolean;
  isStreamlined: boolean;
  onVerboseChange: (checked: boolean) => void;
  onStreamlinedChange: (checked: boolean) => void;
  onAskWinston: () => void;
  onApplyQuickEdit?: (type: 'verbose' | 'streamlined') => void;
}

export function QuickEditsPanel({
  isVerbose,
  isStreamlined,
  onVerboseChange,
  onStreamlinedChange,
  onAskWinston,
  onApplyQuickEdit,
}: QuickEditsPanelProps) {
  const [showChatInput, setShowChatInput] = useState(false);
  const [chatInput, setChatInput] = useState('');

  const handleAskWinstonClick = () => {
    setShowChatInput(!showChatInput);
    if (!showChatInput) {
      onAskWinston();
    }
  };

  const handleApplyQuickEdit = (type: 'verbose' | 'streamlined') => {
    if (onApplyQuickEdit) {
      onApplyQuickEdit(type);
    }
  };

  const hasQuickEditSelected = isVerbose || isStreamlined;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground">Quick Edits</h4>
      
      <div className="flex items-center gap-4 flex-wrap">
        <Button 
          onClick={handleAskWinstonClick}
          className="rounded-xl gap-2"
          variant={showChatInput ? "secondary" : "default"}
          size="sm"
        >
          {showChatInput ? (
            <>
              <X className="h-4 w-4" />
              Close Chat
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Ask Winston
            </>
          )}
        </Button>

        <div className="flex items-center gap-2">
          <Checkbox 
            id="verbose" 
            checked={isVerbose}
            onCheckedChange={(checked) => {
              onVerboseChange(checked as boolean);
              if (checked) onStreamlinedChange(false);
            }}
          />
          <label 
            htmlFor="verbose" 
            className="text-sm text-foreground cursor-pointer"
          >
            More Verbose
          </label>
        </div>
        
        <div className="flex items-center gap-2">
          <Checkbox 
            id="streamlined" 
            checked={isStreamlined}
            onCheckedChange={(checked) => {
              onStreamlinedChange(checked as boolean);
              if (checked) onVerboseChange(false);
            }}
          />
          <label 
            htmlFor="streamlined" 
            className="text-sm text-foreground cursor-pointer"
          >
            More Streamlined
          </label>
        </div>

        {hasQuickEditSelected && (
          <Button
            onClick={() => handleApplyQuickEdit(isVerbose ? 'verbose' : 'streamlined')}
            size="sm"
            variant="outline"
            className="rounded-xl gap-2"
          >
            <Play className="h-4 w-4" />
            Go
          </Button>
        )}
      </div>

      {/* Chat Input - shown when Ask Winston is clicked */}
      {showChatInput && (
        <div className="animate-fade-in space-y-2">
          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask Winston to help with your talk points..."
            className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none min-h-[80px]"
          />
          <div className="flex justify-end">
            <Button size="sm" className="rounded-xl">
              Send
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
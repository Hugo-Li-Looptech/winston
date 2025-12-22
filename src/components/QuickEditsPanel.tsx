import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, Send, X, Check, Loader2 } from 'lucide-react';

interface QuickEditsPanelProps {
  isVerbose: boolean;
  isStreamlined: boolean;
  onVerboseChange: (checked: boolean) => void;
  onStreamlinedChange: (checked: boolean) => void;
  onAskWinston: (prompt: string) => void;
  onApplyQuickEdit?: (type: 'verbose' | 'streamlined') => void;
  suggestedTalkPoints?: string | null;
  suggestionType?: 'verbose' | 'streamlined' | 'custom' | null;
  isGenerating?: boolean;
  onAcceptSuggestion?: () => void;
  onRejectSuggestion?: () => void;
}

export function QuickEditsPanel({
  isVerbose,
  isStreamlined,
  onVerboseChange,
  onStreamlinedChange,
  onAskWinston,
  onApplyQuickEdit,
  suggestedTalkPoints,
  suggestionType,
  isGenerating,
  onAcceptSuggestion,
  onRejectSuggestion,
}: QuickEditsPanelProps) {
  const [showChatInput, setShowChatInput] = useState(false);
  const [chatInput, setChatInput] = useState('');

  const handleAskWinstonClick = () => {
    setShowChatInput(!showChatInput);
  };

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      onAskWinston(chatInput.trim());
      setChatInput('');
    }
  };

  const handleVerboseChange = (checked: boolean) => {
    onVerboseChange(checked);
    if (checked && onApplyQuickEdit) {
      // Automatically trigger generation when checked
      onApplyQuickEdit('verbose');
    }
  };

  const handleStreamlinedChange = (checked: boolean) => {
    onStreamlinedChange(checked);
    if (checked && onApplyQuickEdit) {
      // Automatically trigger generation when checked
      onApplyQuickEdit('streamlined');
    }
  };

  const getSuggestionTitle = () => {
    switch (suggestionType) {
      case 'verbose':
        return 'More Verbose Version';
      case 'streamlined':
        return 'Streamlined Version';
      case 'custom':
        return "Winston's Suggestion";
      default:
        return 'Suggestion';
    }
  };

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
            disabled={isGenerating}
            onCheckedChange={(checked) => {
              handleVerboseChange(checked as boolean);
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
            disabled={isGenerating}
            onCheckedChange={(checked) => {
              handleStreamlinedChange(checked as boolean);
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

        {isGenerating && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating...
          </div>
        )}
      </div>

      {/* Chat Input - shown when Ask Winston is clicked */}
      {showChatInput && (
        <div className="animate-fade-in">
          <div className="relative">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask Winston to help with your talk points..."
              className="w-full px-4 py-3 pr-12 bg-muted/50 border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none min-h-[80px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button 
              size="icon" 
              className="absolute bottom-2 right-2 h-8 w-8 rounded-lg"
              onClick={handleSendMessage}
              disabled={!chatInput.trim() || isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Suggestion Preview */}
      {suggestedTalkPoints && !isGenerating && (
        <div className="animate-fade-in mt-4 p-4 bg-primary/5 rounded-2xl">
          <p className="text-sm font-medium text-primary mb-2">
            {getSuggestionTitle()}
          </p>
          <p className="text-sm text-primary/80 whitespace-pre-wrap">
            {suggestedTalkPoints}
          </p>
          <div className="flex gap-2 mt-3">
            <Button 
              size="sm" 
              onClick={onAcceptSuggestion}
              className="gap-1 rounded-xl"
            >
              <Check className="h-3 w-3" />
              Accept
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onRejectSuggestion}
              className="gap-1 rounded-xl"
            >
              <X className="h-3 w-3" />
              Reject
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

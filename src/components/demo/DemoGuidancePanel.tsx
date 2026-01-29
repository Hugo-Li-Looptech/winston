import { useDemoMode } from '@/contexts/DemoModeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ChevronRight, Eye, Lightbulb, Zap, SkipForward, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DemoGuidancePanel() {
  const {
    isActive,
    guidanceVisible,
    toggleGuidance,
    getCurrentScenario,
    getProgress,
    skipScenario,
    exitDemo,
  } = useDemoMode();

  if (!isActive) return null;

  const scenario = getCurrentScenario();
  const { current, total } = getProgress();

  if (!scenario) return null;

  // Collapsed state - just a small floating button
  if (!guidanceVisible) {
    return (
      <Button
        onClick={toggleGuidance}
        className="fixed bottom-24 left-4 z-50 rounded-full shadow-lg gap-2"
        size="sm"
      >
        <GraduationCap className="h-4 w-4" />
        Demo {current}/{total}
      </Button>
    );
  }

  const stageColors: Record<string, string> = {
    upload: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    wizard: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    voice: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
    scripting: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    preview: 'bg-green-500/10 text-green-600 dark:text-green-400',
  };

  return (
    <Card className="fixed bottom-24 left-4 z-50 w-80 shadow-xl border-primary/20 animate-in slide-in-from-bottom-4 duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm">Demo Mode</CardTitle>
              <p className="text-xs text-muted-foreground">Step {current} of {total}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={toggleGuidance}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-muted rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(current / total) * 100}%` }}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Scenario Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={cn('text-xs', stageColors[scenario.stage])}>
            {scenario.stage.charAt(0).toUpperCase() + scenario.stage.slice(1)}
          </Badge>
          <span className="text-sm font-medium text-foreground">{scenario.title}</span>
        </div>

        {/* Instruction */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-sm text-foreground">{scenario.instruction}</p>
          </div>
        </div>

        {/* Trigger Info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Zap className="h-3 w-3" />
          <span>Trigger: {scenario.trigger}</span>
        </div>

        {/* Pattern */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Eye className="h-3 w-3 mt-0.5 shrink-0" />
          <span>Watch for: {scenario.pattern}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={skipScenario}
          >
            <SkipForward className="h-3 w-3 mr-1" />
            Skip
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={exitDemo}
          >
            Exit Demo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

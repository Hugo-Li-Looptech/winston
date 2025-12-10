import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Sparkles } from 'lucide-react';
import { RubricLevel, RUBRIC_LEVELS } from '@/types/course';

interface AddCriteriaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (cells: { level: RubricLevel; description: string }[]) => void;
  questionText?: string;
}

const SCORE_PERCENTAGES: Record<RubricLevel, string> = {
  beginning: '20%',
  approaching: '40%',
  meeting: '60%',
  exceeding: '≥80%',
};

export function AddCriteriaDialog({ open, onOpenChange, onAdd, questionText }: AddCriteriaDialogProps) {
  const [cellDescriptions, setCellDescriptions] = useState<Record<RubricLevel, string>>({
    beginning: '',
    approaching: '',
    meeting: '',
    exceeding: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAdd = () => {
    const cells = RUBRIC_LEVELS.map(({ level }) => ({
      level,
      description: cellDescriptions[level],
    }));
    
    onAdd(cells);
    
    // Reset form
    setCellDescriptions({
      beginning: '',
      approaching: '',
      meeting: '',
      exceeding: '',
    });
    onOpenChange(false);
  };

  const updateCellDescription = (level: RubricLevel, value: string) => {
    setCellDescriptions(prev => ({ ...prev, [level]: value }));
  };

  const handleGenerateWithAI = async () => {
    setIsGenerating(true);
    // Simulate AI generation - in real implementation, this would call an AI service
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const baseContext = questionText || 'the learning objective';
    setCellDescriptions({
      beginning: `Shows limited understanding of ${baseContext}. Requires significant support and guidance.`,
      approaching: `Demonstrates developing understanding of ${baseContext}. Some concepts are grasped but inconsistently applied.`,
      meeting: `Shows solid understanding of ${baseContext}. Applies concepts correctly with minor errors.`,
      exceeding: `Demonstrates exceptional mastery of ${baseContext}. Applies concepts creatively and extends understanding.`,
    });
    setIsGenerating(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-background">
        <DialogHeader>
          <DialogTitle>Add Criteria Item</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left text-xs font-medium text-foreground p-3 w-32 border-r border-border">
                    Criteria
                  </th>
                  <th className="text-left text-xs font-medium text-foreground p-3">
                    Add Criteria Item
                  </th>
                </tr>
              </thead>
              <tbody>
                {RUBRIC_LEVELS.map(({ level, label }) => (
                  <tr key={level} className="border-t border-border">
                    <td className="p-3 border-r border-border bg-muted/30">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {SCORE_PERCENTAGES[level]}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Textarea
                        value={cellDescriptions[level]}
                        onChange={(e) => updateCellDescription(level, e.target.value)}
                        placeholder="Type in the criteria description..."
                        className="min-h-[80px] text-sm rounded-lg resize-none"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleGenerateWithAI}
            disabled={isGenerating}
            className="gap-2 rounded-xl mr-auto"
          >
            <Sparkles className="h-4 w-4" />
            {isGenerating ? 'Generating...' : 'Gen w/ AI'}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleAdd} className="rounded-xl">
              Add Criteria
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

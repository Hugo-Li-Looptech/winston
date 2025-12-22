import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
  onAdd: (cells: { level: RubricLevel; description: string }[], criteriaName: string) => void;
  questionText?: string;
}

const SCORE_PERCENTAGES: Record<RubricLevel, string> = {
  beginning: '20%',
  approaching: '40%',
  meeting: '60%',
  exceeding: '≥80%',
};

// AI-generated default descriptions
const getDefaultDescriptions = (topic: string): Record<RubricLevel, string> => ({
  beginning: `Shows limited understanding of ${topic}. Requires significant support and guidance.`,
  approaching: `Demonstrates developing understanding of ${topic}. Some concepts are grasped but inconsistently applied.`,
  meeting: `Shows solid understanding of ${topic}. Applies concepts correctly with minor errors.`,
  exceeding: `Demonstrates exceptional mastery of ${topic}. Applies concepts creatively and extends understanding.`,
});

export function AddCriteriaDialog({ open, onOpenChange, onAdd, questionText }: AddCriteriaDialogProps) {
  const [criteriaName, setCriteriaName] = useState('');
  const [cellDescriptions, setCellDescriptions] = useState<Record<RubricLevel, string>>(
    getDefaultDescriptions('the learning objective')
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAIGenerated, setIsAIGenerated] = useState(true);

  // Prefill with AI defaults when dialog opens
  useEffect(() => {
    if (open) {
      const topic = questionText || 'the learning objective';
      setCellDescriptions(getDefaultDescriptions(topic));
      setCriteriaName('');
      setIsAIGenerated(true);
    }
  }, [open, questionText]);

  const handleAdd = () => {
    const cells = RUBRIC_LEVELS.map(({ level }) => ({
      level,
      description: cellDescriptions[level],
    }));
    
    onAdd(cells, criteriaName || 'Add Criteria Item');
    
    // Reset form
    const topic = questionText || 'the learning objective';
    setCellDescriptions(getDefaultDescriptions(topic));
    setCriteriaName('');
    setIsAIGenerated(true);
    onOpenChange(false);
  };

  const updateCellDescription = (level: RubricLevel, value: string) => {
    setCellDescriptions(prev => ({ ...prev, [level]: value }));
    setIsAIGenerated(false);
  };

  const handleGenerateWithAI = async () => {
    setIsGenerating(true);
    // Simulate AI generation - in real implementation, this would call an AI service
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const baseContext = criteriaName || questionText || 'the learning objective';
    setCellDescriptions(getDefaultDescriptions(baseContext));
    setIsAIGenerated(true);
    setIsGenerating(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-background">
        <DialogHeader>
          <DialogTitle>Add Criteria Item</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Criteria Topic Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Criteria Topic</label>
            <Input
              value={criteriaName}
              onChange={(e) => setCriteriaName(e.target.value)}
              placeholder="Add Criteria Item"
              className="rounded-xl"
            />
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left text-xs font-medium text-foreground p-3 w-32 border-r border-border">
                    Criteria
                  </th>
                  <th className="text-left text-xs font-medium text-foreground p-3">
                    {criteriaName || 'Add Criteria Item'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {RUBRIC_LEVELS.map(({ level, label }, index) => (
                  <tr key={level} className="border-t border-border">
                    <td className="p-3 border-r border-border bg-muted/30">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">
                            {label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {SCORE_PERCENTAGES[level]}
                          </span>
                        </div>
                        {/* Green AI indicator on first row */}
                        {index === 0 && isAIGenerated && (
                          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" title="AI-generated" />
                        )}
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

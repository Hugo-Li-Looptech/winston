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
import { Input } from '@/components/ui/input';
import { RubricLevel, RUBRIC_LEVELS } from '@/types/course';

interface AddCriteriaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (criteriaName: string, cells: { level: RubricLevel; description: string }[]) => void;
}

const SCORE_PERCENTAGES: Record<RubricLevel, string> = {
  beginning: '20%',
  approaching: '40%',
  meeting: '60%',
  exceeding: '≥80%',
};

export function AddCriteriaDialog({ open, onOpenChange, onAdd }: AddCriteriaDialogProps) {
  const [criteriaName, setCriteriaName] = useState('');
  const [cellDescriptions, setCellDescriptions] = useState<Record<RubricLevel, string>>({
    beginning: '',
    approaching: '',
    meeting: '',
    exceeding: '',
  });

  const handleAdd = () => {
    if (!criteriaName.trim()) return;
    
    const cells = RUBRIC_LEVELS.map(({ level }) => ({
      level,
      description: cellDescriptions[level],
    }));
    
    onAdd(criteriaName, cells);
    
    // Reset form
    setCriteriaName('');
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-background">
        <DialogHeader>
          <DialogTitle>Add New Criteria</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Criteria Name
            </label>
            <Input
              value={criteriaName}
              onChange={(e) => setCriteriaName(e.target.value)}
              placeholder="Enter criteria name..."
              className="rounded-lg"
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
                    Add Criteria Item
                  </th>
                </tr>
              </thead>
              <tbody>
                {RUBRIC_LEVELS.map(({ level, label }) => (
                  <tr key={level} className="border-t border-border">
                    <td className="p-3 border-r border-border">
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!criteriaName.trim()} className="rounded-xl">
            Add Criteria
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

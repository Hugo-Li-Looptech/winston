import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { RubricCriteria, RubricCell, RUBRIC_LEVELS, RubricLevel } from '@/types/course';
import { AddCriteriaDialog } from './AddCriteriaDialog';

interface RubricEditorProps {
  criteria: RubricCriteria[];
  cells: RubricCell[];
  onCriteriaChange: (criteria: RubricCriteria[]) => void;
  onCellsChange: (cells: RubricCell[]) => void;
  questionText?: string;
}

const SCORE_PERCENTAGES: Record<RubricLevel, string> = {
  beginning: '20%',
  approaching: '40%',
  meeting: '60%',
  exceeding: '≥80%',
};

export function RubricEditor({
  criteria,
  cells,
  onCriteriaChange,
  onCellsChange,
  questionText,
}: RubricEditorProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddCriteria = (
    cellData: { level: RubricLevel; description: string }[]
  ) => {
    const newCriteria: RubricCriteria = {
      id: Date.now().toString(),
      name: `Criteria ${criteria.length + 1}`,
    };
    
    const newCells = cellData.map(({ level, description }) => ({
      criteriaId: newCriteria.id,
      level,
      description,
    }));
    
    console.log('Adding criteria:', newCriteria);
    console.log('Adding cells:', newCells);
    console.log('Current criteria before update:', criteria);
    console.log('Current cells before update:', cells);
    
    onCriteriaChange([...criteria, newCriteria]);
    onCellsChange([...cells, ...newCells]);
  };

  console.log('RubricEditor render - criteria:', criteria, 'cells:', cells);

  const removeCriteria = (criteriaId: string) => {
    onCriteriaChange(criteria.filter((c) => c.id !== criteriaId));
    onCellsChange(cells.filter((c) => c.criteriaId !== criteriaId));
  };

  const updateCellDescription = (criteriaId: string, level: RubricLevel, description: string) => {
    const existingCell = cells.find(
      (c) => c.criteriaId === criteriaId && c.level === level
    );

    if (existingCell) {
      onCellsChange(
        cells.map((c) =>
          c.criteriaId === criteriaId && c.level === level
            ? { ...c, description }
            : c
        )
      );
    } else {
      onCellsChange([...cells, { criteriaId, level, description }]);
    }
  };

  const getCellDescription = (criteriaId: string, level: RubricLevel): string => {
    return cells.find((c) => c.criteriaId === criteriaId && c.level === level)?.description || '';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">Rubric Criteria</h4>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="gap-1 rounded-xl"
        >
          <Plus className="h-3 w-3" />
          Add Criteria
        </Button>
      </div>

      {criteria.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No criteria added yet. Click "Add Criteria" to start building your rubric.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full table-fixed">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left text-xs font-medium text-foreground p-3 w-28 border-r border-border">
                    Criteria
                  </th>
                  {criteria.map((c, index) => (
                    <th key={c.id} className="text-left p-3 w-44 border-r border-border">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-foreground truncate">
                          Item {index + 1}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 shrink-0"
                          onClick={() => removeCriteria(c.id)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </th>
                  ))}
                  <th className="p-2 w-12 bg-muted/30">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 rounded-lg"
                      onClick={() => setDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {RUBRIC_LEVELS.map((level) => (
                  <tr key={level.level} className="border-t border-border">
                    <td className="p-3 border-r border-border bg-muted/30 w-28">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {level.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {SCORE_PERCENTAGES[level.level]}
                        </span>
                      </div>
                    </td>
                    {criteria.map((c) => (
                      <td key={`${c.id}-${level.level}`} className="p-2 border-r border-border w-44">
                        <Textarea
                          value={getCellDescription(c.id, level.level)}
                          onChange={(e) =>
                            updateCellDescription(c.id, level.level, e.target.value)
                          }
                          placeholder="Type in the criteria description..."
                          className="min-h-[70px] text-xs rounded-lg resize-none"
                        />
                      </td>
                    ))}
                    <td className="p-2 w-12 bg-muted/30"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Scoring explanation */}
      <div className="bg-muted/50 rounded-xl p-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Scoring Logic:</p>
        <p>
          Beginning: 20% | Approaching: 40% | Meeting: 60% | Exceeding: ≥80%.
          Each criteria is scored independently. The total score determines the final grade level.
        </p>
      </div>

      <AddCriteriaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAdd={handleAddCriteria}
        questionText={questionText}
      />
    </div>
  );
}

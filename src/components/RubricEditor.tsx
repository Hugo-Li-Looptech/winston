import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { RubricCriteria, RubricCell, RUBRIC_LEVELS, RubricLevel } from '@/types/course';

interface RubricEditorProps {
  criteria: RubricCriteria[];
  cells: RubricCell[];
  onCriteriaChange: (criteria: RubricCriteria[]) => void;
  onCellsChange: (cells: RubricCell[]) => void;
}

export function RubricEditor({
  criteria,
  cells,
  onCriteriaChange,
  onCellsChange,
}: RubricEditorProps) {
  const addCriteria = () => {
    const newCriteria: RubricCriteria = {
      id: Date.now().toString(),
      name: '',
    };
    onCriteriaChange([...criteria, newCriteria]);
    
    // Add cells for each level for the new criteria
    const newCells = RUBRIC_LEVELS.map((level) => ({
      criteriaId: newCriteria.id,
      level: level.level,
      description: '',
    }));
    onCellsChange([...cells, ...newCells]);
  };

  const removeCriteria = (criteriaId: string) => {
    onCriteriaChange(criteria.filter((c) => c.id !== criteriaId));
    onCellsChange(cells.filter((c) => c.criteriaId !== criteriaId));
  };

  const updateCriteriaName = (criteriaId: string, name: string) => {
    onCriteriaChange(
      criteria.map((c) => (c.id === criteriaId ? { ...c, name } : c))
    );
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
          onClick={addCriteria}
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
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left text-xs font-medium text-muted-foreground p-2 border-b">
                  Level / Points
                </th>
                {criteria.map((c) => (
                  <th key={c.id} className="text-left p-2 border-b min-w-[150px]">
                    <div className="flex items-center gap-2">
                      <Input
                        value={c.name}
                        onChange={(e) => updateCriteriaName(c.id, e.target.value)}
                        placeholder="Criteria name"
                        className="text-xs h-8 rounded-lg"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => removeCriteria(c.id)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RUBRIC_LEVELS.map((level) => (
                <tr key={level.level}>
                  <td className="p-2 border-b">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {level.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {level.points} pts
                      </span>
                    </div>
                  </td>
                  {criteria.map((c) => (
                    <td key={`${c.id}-${level.level}`} className="p-2 border-b">
                      <Input
                        value={getCellDescription(c.id, level.level)}
                        onChange={(e) =>
                          updateCellDescription(c.id, level.level, e.target.value)
                        }
                        placeholder={`${level.label} criteria...`}
                        className="text-xs h-8 rounded-lg"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Scoring explanation */}
      <div className="bg-muted/50 rounded-xl p-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Scoring Logic:</p>
        <p>
          Each criteria is scored independently. The total score is the sum of points
          earned across all criteria divided by the maximum possible points. If the
          score falls below the passing threshold, the question receives 0 points.
        </p>
      </div>
    </div>
  );
}

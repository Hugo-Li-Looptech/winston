import { CourseGroup } from "@/types/courseGroup";
import { Course } from "@/types/course";
import { Button } from "@/components/ui/button";
import { FolderOpen, Clock, Target, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CourseGroupCardProps {
  group: CourseGroup;
  courses: Course[];
  onOpen: (group: CourseGroup) => void;
  onEdit: (group: CourseGroup) => void;
  onDelete: (groupId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, groupId: string) => void;
}

export function CourseGroupCard({
  group,
  courses,
  onOpen,
  onEdit,
  onDelete,
  onDragOver,
  onDrop,
}: CourseGroupCardProps) {
  const groupCourses = courses.filter((c) => group.courseIds.includes(c.id));
  const completedMilestones = group.milestones.filter((m) => m.isCompleted).length;

  return (
    <div
      className="group relative rounded-2xl overflow-hidden flex flex-col backdrop-blur-xl bg-card/60 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-accent/30 cursor-pointer"
      onClick={() => onOpen(group)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, group.id)}
    >
      {/* Color accent bar */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: group.color }}
      />

      {/* Glossy overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

      {/* Accent glow */}
      <div
        className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40"
        style={{ backgroundColor: group.color }}
      />

      <div className="p-5 flex-1 flex flex-col relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${group.color}20` }}
            >
              <FolderOpen className="h-4 w-4" style={{ color: group.color }} />
            </div>
            <span className="text-xs text-muted-foreground/80 font-medium">
              {groupCourses.length} course{groupCourses.length !== 1 ? "s" : ""}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-60 hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(group); }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete(group.id); }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h3 className="font-semibold text-foreground line-clamp-2 text-sm tracking-tight mb-2">
          {group.title}
        </h3>

        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {group.description || "No description"}
        </p>

        <div className="flex-1 min-h-[1rem]" />

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground/80">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{group.projectedHours}h</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5" />
            <span>{group.learningGoals.length} goals</span>
          </div>
        </div>
      </div>

      {/* Progress footer */}
      <div className="px-5 py-3 border-t border-border/30 bg-muted/20 relative z-10">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Milestones</span>
          <span className="font-semibold text-muted-foreground">
            {completedMilestones}/{group.milestones.length}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 bg-muted/50 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: group.milestones.length > 0
                ? `${(completedMilestones / group.milestones.length) * 100}%`
                : "0%",
              backgroundColor: group.color,
            }}
          />
        </div>
      </div>
    </div>
  );
}

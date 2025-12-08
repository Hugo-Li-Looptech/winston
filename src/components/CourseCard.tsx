import { Course } from "@/types/course";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Play, Edit, Copy, Eye, EyeOff, Trash2 } from "lucide-react";

interface CourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
  onPreview: (courseId: string) => void;
  onDuplicate: (courseId: string) => void;
  onTogglePublish: (course: Course) => void;
  onDelete: (courseId: string) => void;
}

const getProgressPercent = (progress: Course["progress"]) => {
  const percentages: Record<string, number> = {
    "slides_uploaded": 20,
    "wizard_complete": 40,
    "setting_talk_points": 60,
    "awaiting_preview": 80,
    "0%": 0,
    "100%": 100,
  };
  return percentages[progress] ?? 0;
};

const getProgressColor = (percent: number) => {
  if (percent === 100) return "bg-green-500";
  if (percent >= 60) return "bg-amber-500";
  if (percent >= 20) return "bg-blue-500";
  return "bg-muted-foreground";
};

export function CourseCard({
  course,
  onEdit,
  onPreview,
  onDuplicate,
  onTogglePublish,
  onDelete,
}: CourseCardProps) {
  const progressPercent = getProgressPercent(course.progress);
  
  return (
    <div className="group relative rounded-2xl overflow-hidden flex flex-col backdrop-blur-xl bg-card/60 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-accent/30">
      {/* Glossy overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
      
      {/* Accent glow based on progress */}
      <div 
        className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40 ${
          progressPercent === 100 ? 'bg-green-500' : progressPercent >= 60 ? 'bg-amber-500' : 'bg-primary'
        }`}
      />
      
      <div className="p-5 flex-1 flex flex-col relative z-10">
        <div className="flex items-start justify-between mb-1">
          <span className="text-xs text-muted-foreground/80 font-medium">{course.date}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-1 opacity-60 hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onPreview(course.id)}>
                <Play className="h-4 w-4 mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(course)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(course.id)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTogglePublish(course)}>
                {course.status === "published" ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Publish
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(course.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <h3 className="font-semibold text-foreground line-clamp-2 text-sm tracking-tight">{course.title}</h3>
        
        <div className="flex-1 min-h-[3rem]" />
        
        <Button 
          variant="outline" 
          size="sm"
          className="w-full rounded-xl text-xs h-7 bg-primary/10 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 font-medium"
          onClick={() => onEdit(course)}
        >
          <Edit className="h-3 w-3 mr-1.5" />
          Edit
        </Button>
      </div>
      
      <div className="px-5 py-3 border-t border-border/30 bg-muted/20 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className={`h-full ${getProgressColor(progressPercent)} transition-all duration-500 ease-out`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-muted-foreground min-w-[2.5rem] text-right">
            {progressPercent}%
          </span>
        </div>
      </div>
    </div>
  );
}

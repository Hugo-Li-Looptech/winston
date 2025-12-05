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

const getProgressLabel = (progress: Course["progress"]) => {
  const labels: Record<string, string> = {
    "slides_uploaded": "Slides Uploaded",
    "wizard_complete": "Wizard Complete",
    "setting_talk_points": "Setting Talk Points",
    "awaiting_preview": "Awaiting Preview",
    "0%": "Not Started",
    "100%": "Complete",
  };
  return labels[progress] || progress;
};

export function CourseCard({
  course,
  onEdit,
  onPreview,
  onDuplicate,
  onTogglePublish,
  onDelete,
}: CourseCardProps) {
  return (
    <div className="bg-card rounded-2xl shadow-sm border overflow-hidden flex flex-col">
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between mb-3">
          <span className="text-sm text-muted-foreground">{course.date}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
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
        
        <h3 className="font-semibold text-foreground mb-4 line-clamp-2">{course.title}</h3>
        
        <Button 
          variant="outline" 
          className="w-full rounded-xl"
          onClick={() => onEdit(course)}
        >
          Edit
        </Button>
      </div>
      
      <div className="bg-muted/50 px-5 py-3 border-t">
        <span className="text-sm text-muted-foreground">{getProgressLabel(course.progress)}</span>
      </div>
    </div>
  );
}

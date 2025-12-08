import { useState } from "react";
import { CourseGroup, GROUP_COLORS, LearningMilestone } from "@/types/courseGroup";
import { Course } from "@/types/course";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  X,
  Plus,
  Clock,
  Target,
  BookOpen,
  Flag,
  Trash2,
  GripVertical,
} from "lucide-react";
import { CourseCard } from "./CourseCard";

interface GroupDetailPanelProps {
  group: CourseGroup | null;
  courses: Course[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateGroup: (group: CourseGroup) => void;
  onRemoveCourseFromGroup: (courseId: string, groupId: string) => void;
  onEditCourse: (course: Course) => void;
  onPreviewCourse: (courseId: string) => void;
  onDuplicateCourse: (courseId: string) => void;
  onTogglePublish: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
}

export function GroupDetailPanel({
  group,
  courses,
  open,
  onOpenChange,
  onUpdateGroup,
  onRemoveCourseFromGroup,
  onEditCourse,
  onPreviewCourse,
  onDuplicateCourse,
  onTogglePublish,
  onDeleteCourse,
}: GroupDetailPanelProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [newGoal, setNewGoal] = useState("");
  const [newMilestone, setNewMilestone] = useState("");

  if (!group) return null;

  const groupCourses = courses.filter((c) => group.courseIds.includes(c.id));

  const handleUpdateTitle = (title: string) => {
    onUpdateGroup({ ...group, title });
  };

  const handleUpdateDescription = (description: string) => {
    onUpdateGroup({ ...group, description });
  };

  const handleUpdateHours = (hours: number) => {
    onUpdateGroup({ ...group, projectedHours: hours });
  };

  const handleUpdateColor = (color: string) => {
    onUpdateGroup({ ...group, color });
  };

  const handleAddGoal = () => {
    if (!newGoal.trim()) return;
    onUpdateGroup({
      ...group,
      learningGoals: [...group.learningGoals, newGoal.trim()],
    });
    setNewGoal("");
  };

  const handleRemoveGoal = (index: number) => {
    onUpdateGroup({
      ...group,
      learningGoals: group.learningGoals.filter((_, i) => i !== index),
    });
  };

  const handleAddMilestone = () => {
    if (!newMilestone.trim()) return;
    const milestone: LearningMilestone = {
      id: `milestone-${Date.now()}`,
      title: newMilestone.trim(),
      description: "",
      isCompleted: false,
    };
    onUpdateGroup({
      ...group,
      milestones: [...group.milestones, milestone],
    });
    setNewMilestone("");
  };

  const handleToggleMilestone = (milestoneId: string) => {
    onUpdateGroup({
      ...group,
      milestones: group.milestones.map((m) =>
        m.id === milestoneId ? { ...m, isCompleted: !m.isCompleted } : m
      ),
    });
  };

  const handleRemoveMilestone = (milestoneId: string) => {
    onUpdateGroup({
      ...group,
      milestones: group.milestones.filter((m) => m.id !== milestoneId),
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-start gap-3">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${group.color}20` }}
            >
              <BookOpen className="h-5 w-5" style={{ color: group.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <Input
                value={group.title}
                onChange={(e) => handleUpdateTitle(e.target.value)}
                className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0"
                placeholder="Group Title"
              />
              <p className="text-sm text-muted-foreground mt-1">
                {groupCourses.length} course{groupCourses.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-6 mt-4 w-fit">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            {/* Overview Tab */}
            <TabsContent value="overview" className="p-6 pt-4 m-0">
              {/* Description */}
              <div className="mb-6">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Description
                </label>
                <Textarea
                  value={group.description}
                  onChange={(e) => handleUpdateDescription(e.target.value)}
                  placeholder="Describe what this group covers..."
                  className="resize-none"
                  rows={3}
                />
              </div>

              {/* Color */}
              <div className="mb-6">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Color
                </label>
                <div className="flex gap-2">
                  {GROUP_COLORS.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => handleUpdateColor(color.value)}
                      className={`h-8 w-8 rounded-full transition-all ${
                        group.color === color.value
                          ? "ring-2 ring-offset-2 ring-primary"
                          : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Projected Hours */}
              <div className="mb-6">
                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Projected Hours
                </label>
                <Input
                  type="number"
                  min={0}
                  value={group.projectedHours}
                  onChange={(e) => handleUpdateHours(Number(e.target.value))}
                  className="w-32"
                />
              </div>

              {/* Learning Goals */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Learning Goals
                </label>
                <div className="space-y-2 mb-3">
                  {group.learningGoals.map((goal, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                    >
                      <span className="flex-1 text-sm">{goal}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveGoal(index)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="Add a learning goal..."
                    onKeyDown={(e) => e.key === "Enter" && handleAddGoal()}
                  />
                  <Button size="icon" onClick={handleAddGoal}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses" className="p-6 pt-4 m-0">
              {groupCourses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No courses in this group yet.</p>
                  <p className="text-xs mt-1">Drag courses here to add them.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {groupCourses.map((course) => (
                    <div key={course.id} className="relative">
                      <CourseCard
                        course={course}
                        onEdit={onEditCourse}
                        onPreview={onPreviewCourse}
                        onDuplicate={onDuplicateCourse}
                        onTogglePublish={onTogglePublish}
                        onDelete={onDeleteCourse}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 left-2 h-6 text-xs bg-background/80 backdrop-blur-sm"
                        onClick={() => onRemoveCourseFromGroup(course.id, group.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Roadmap Tab */}
            <TabsContent value="roadmap" className="p-6 pt-4 m-0">
              <label className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Flag className="h-4 w-4" />
                Milestones
              </label>

              <div className="space-y-2 mb-4">
                {group.milestones.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                      milestone.isCompleted
                        ? "bg-primary/5 border-primary/20"
                        : "bg-card border-border"
                    }`}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab" />
                    <Checkbox
                      checked={milestone.isCompleted}
                      onCheckedChange={() => handleToggleMilestone(milestone.id)}
                    />
                    <div className="flex-1">
                      <span
                        className={`text-sm ${
                          milestone.isCompleted
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {milestone.title}
                      </span>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Milestone {index + 1}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveMilestone(milestone.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newMilestone}
                  onChange={(e) => setNewMilestone(e.target.value)}
                  placeholder="Add a milestone..."
                  onKeyDown={(e) => e.key === "Enter" && handleAddMilestone()}
                />
                <Button size="icon" onClick={handleAddMilestone}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Roadmap visualization */}
              {group.milestones.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-sm font-medium mb-4">Progress Roadmap</h4>
                  <div className="relative pl-4">
                    <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border" />
                    {group.milestones.map((milestone, index) => (
                      <div key={milestone.id} className="relative flex items-start gap-4 pb-6 last:pb-0">
                        <div
                          className={`relative z-10 h-4 w-4 rounded-full border-2 ${
                            milestone.isCompleted
                              ? "border-primary bg-primary"
                              : "border-muted-foreground bg-background"
                          }`}
                        >
                          {milestone.isCompleted && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 -mt-0.5">
                          <p
                            className={`text-sm font-medium ${
                              milestone.isCompleted ? "text-primary" : "text-foreground"
                            }`}
                          >
                            {milestone.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {milestone.isCompleted ? "Completed" : "In progress"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

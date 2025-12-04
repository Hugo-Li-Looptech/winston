import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  MoreHorizontal,
  GraduationCap,
  LogOut,
  FolderOpen,
  Edit,
  Copy,
  EyeOff,
  Eye,
  Trash2,
  Play,
  Sparkles,
} from "lucide-react";
import { useCourse } from "@/contexts/CourseContext";
import { AIAssistant } from "@/components/AIAssistant";
import { Course } from "@/types/course";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { TutorialSlideshow } from "@/components/TutorialSlideshow";

export default function Dashboard() {
  const navigate = useNavigate();
  const { courses, resetCurrentCourse, deleteCourse, updateCourseStatus, duplicateCourse } = useCourse();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const hasNoCourses = courses.length === 0;

  const handleCreateCourse = () => {
    resetCurrentCourse();
    navigate("/create");
  };

  const handleEditCourse = (courseId: string) => {
    navigate("/create");
  };

  const handlePreviewCourse = (courseId: string) => {
    navigate("/create?mode=preview");
  };

  const handleDuplicateCourse = (courseId: string) => {
    duplicateCourse(courseId);
    toast({
      title: "Course duplicated",
      description: "A copy of the course has been created.",
    });
  };

  const handleTogglePublish = (course: Course) => {
    const newStatus = course.status === "published" ? "pending" : "published";
    updateCourseStatus(course.id, newStatus);
    toast({
      title: newStatus === "published" ? "Course published" : "Course unpublished",
      description:
        newStatus === "published"
          ? "The course is now visible to learners."
          : "The course is no longer visible to learners.",
    });
  };

  const handleDeleteClick = (courseId: string) => {
    setCourseToDelete(courseId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (courseToDelete) {
      deleteCourse(courseToDelete);
      toast({
        title: "Course deleted",
        description: "The course has been permanently deleted.",
      });
    }
    setDeleteDialogOpen(false);
    setCourseToDelete(null);
  };

  const filteredCourses = courses.filter((course) => course.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const getStatusBadge = (status: Course["status"]) => {
    const styles: Record<Course["status"], string> = {
      published: "bg-primary/10 text-primary",
      pending: "bg-muted text-muted-foreground",
      in_progress: "bg-accent text-accent-foreground",
    };
    const labels: Record<Course["status"], string> = {
      published: "Published",
      pending: "Pending",
      in_progress: "In Progress",
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-semibold text-foreground">Winston</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">My Courses</h1>
            <p className="text-muted-foreground mt-1">Create and manage your courses</p>
          </div>
          <Button onClick={handleCreateCourse} size="lg" className="rounded-xl gap-2">
            <Plus className="h-5 w-5" />
            New Course
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-xl"
          />
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No courses yet</h3>
            <p className="text-muted-foreground mb-6">
              {hasNoCourses ? "Learn how to create engaging courses with Winston" : "No courses match your search"}
            </p>
            {hasNoCourses ? (
              <Button onClick={() => setShowTutorial(true)} className="rounded-xl gap-2">
                <Sparkles className="h-4 w-4" />
                Start Tutorial
              </Button>
            ) : (
              <Button onClick={handleCreateCourse} className="rounded-xl">
                Create Course
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-card rounded-2xl shadow-sm overflow-hidden animate-fade-in">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Course Name</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Progress</th>
                  <th className="py-4 px-6"></th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-medium text-foreground">{course.title}</span>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground">{course.date}</td>
                    <td className="py-4 px-6">{getStatusBadge(course.status)}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{
                              width: course.progress === "100%" ? "100%" : course.progress === "0%" ? "0%" : "50%",
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{course.progress}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handlePreviewCourse(course.id)}>
                            <Play className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditCourse(course.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateCourse(course.id)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTogglePublish(course)}>
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
                            onClick={() => handleDeleteClick(course.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this course? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AIAssistant />

      <TutorialSlideshow open={showTutorial} onOpenChange={setShowTutorial} />
    </div>
  );
}

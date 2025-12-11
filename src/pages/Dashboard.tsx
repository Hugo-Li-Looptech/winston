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
  LayoutGrid,
  List,
  Filter,
  FolderPlus,
  GitBranch,
} from "lucide-react";
import { useCourse } from "@/contexts/CourseContext";
import { AIAssistant } from "@/components/AIAssistant";
import { Course } from "@/types/course";
import { CourseGroup } from "@/types/courseGroup";
import { CourseCard } from "@/components/CourseCard";
import { CourseGroupCard } from "@/components/CourseGroupCard";
import { GroupDetailPanel } from "@/components/GroupDetailPanel";
import { CreateGroupDialog } from "@/components/CreateGroupDialog";
import { VersionControlDialog } from "@/components/VersionControlDialog";
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

type ViewMode = "card" | "list";
type StatusTab = "all" | "pending" | "in_progress" | "published";

export default function Dashboard() {
  const navigate = useNavigate();
  const { 
    courses, 
    resetCurrentCourse, 
    deleteCourse, 
    updateCourseStatus, 
    duplicateCourse,
    getVersions,
    getCurrentVersionId,
    restoreVersion,
    branchFromVersion,
    saveVersion,
  } = useCourse();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [activeTab, setActiveTab] = useState<StatusTab>("all");

  // Groups state
  const [groups, setGroups] = useState<CourseGroup[]>([]);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<CourseGroup | null>(null);
  const [groupDetailOpen, setGroupDetailOpen] = useState(false);
  const [draggedCourseId, setDraggedCourseId] = useState<string | null>(null);

  // Version control state
  const [versionControlCourseId, setVersionControlCourseId] = useState<string | null>(null);
  const [versionControlOpen, setVersionControlOpen] = useState(false);

  const hasNoCourses = courses.length === 0;

  const handleCreateCourse = () => {
    resetCurrentCourse();
    navigate("/create");
  };

  const handleEditCourse = (course: Course) => {
    let step = 'upload';
    
    switch (course.progress) {
      case 'slides_uploaded':
        step = 'upload';
        break;
      case 'wizard_complete':
        step = 'wizard';
        break;
      case 'setting_talk_points':
        step = 'scripting';
        break;
      case 'awaiting_preview':
      case '100%':
        step = 'preview';
        break;
      case '0%':
        step = 'upload';
        break;
    }
    
    navigate(`/create?mode=edit&step=${step}&courseId=${course.id}`);
  };

  const handlePreviewCourse = (courseId: string) => {
    navigate(`/create?mode=preview&courseId=${courseId}`);
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
    
    // Save a published version when publishing (not when unpublishing)
    if (newStatus === "published") {
      const versionName = `Published - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      saveVersion(course.id, versionName, true);
    }
    
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
      // Also remove from any groups
      setGroups((prev) =>
        prev.map((g) => ({
          ...g,
          courseIds: g.courseIds.filter((id) => id !== courseToDelete),
        }))
      );
      toast({
        title: "Course deleted",
        description: "The course has been permanently deleted.",
      });
    }
    setDeleteDialogOpen(false);
    setCourseToDelete(null);
  };

  // Version control handlers
  const handleVersionControl = (courseId: string) => {
    setVersionControlCourseId(courseId);
    setVersionControlOpen(true);
  };

  const handleRestoreVersion = (versionId: string) => {
    if (versionControlCourseId) {
      restoreVersion(versionControlCourseId, versionId);
    }
  };

  const handleBranchFromVersion = (versionId: string) => {
    if (versionControlCourseId) {
      branchFromVersion(versionControlCourseId, versionId);
    }
  };

  const handleEditVersion = (versionId: string) => {
    if (versionControlCourseId) {
      const course = courses.find((c) => c.id === versionControlCourseId);
      if (course) {
        restoreVersion(versionControlCourseId, versionId);
        handleEditCourse(course);
      }
    }
  };

  // Group handlers
  const handleCreateGroup = (groupData: Omit<CourseGroup, "id" | "createdAt">) => {
    const newGroup: CourseGroup = {
      ...groupData,
      id: `group-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setGroups((prev) => [...prev, newGroup]);
    toast({
      title: "Group created",
      description: `"${newGroup.title}" has been created.`,
    });
  };

  const handleOpenGroup = (group: CourseGroup) => {
    setSelectedGroup(group);
    setGroupDetailOpen(true);
  };

  const handleEditGroup = (group: CourseGroup) => {
    setSelectedGroup(group);
    setGroupDetailOpen(true);
  };

  const handleUpdateGroup = (updatedGroup: CourseGroup) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
    );
    setSelectedGroup(updatedGroup);
  };

  const handleDeleteGroup = (groupId: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    toast({
      title: "Group deleted",
      description: "The group has been deleted. Courses remain unchanged.",
    });
  };

  const handleRemoveCourseFromGroup = (courseId: string, groupId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, courseIds: g.courseIds.filter((id) => id !== courseId) }
          : g
      )
    );
    if (selectedGroup?.id === groupId) {
      setSelectedGroup((prev) =>
        prev
          ? { ...prev, courseIds: prev.courseIds.filter((id) => id !== courseId) }
          : null
      );
    }
    toast({
      title: "Course removed",
      description: "Course removed from group.",
    });
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, courseId: string) => {
    setDraggedCourseId(courseId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, groupId: string) => {
    e.preventDefault();
    if (!draggedCourseId) return;

    // Check if course already in group
    const group = groups.find((g) => g.id === groupId);
    if (group?.courseIds.includes(draggedCourseId)) {
      toast({
        title: "Already in group",
        description: "This course is already in this group.",
      });
      setDraggedCourseId(null);
      return;
    }

    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, courseIds: [...g.courseIds, draggedCourseId] }
          : g
      )
    );

    toast({
      title: "Course added",
      description: "Course added to group.",
    });

    setDraggedCourseId(null);
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || course.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const filteredGroups = groups.filter((group) =>
    group.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const tabs: { key: StatusTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "in_progress", label: "In Progress" },
    { key: "published", label: "Published" },
  ];

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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCreateGroupOpen(true)}
              className="rounded-xl gap-2"
            >
              <FolderPlus className="h-5 w-5" />
              New Group
            </Button>
            <Button onClick={handleCreateCourse} size="lg" className="rounded-xl gap-2">
              <Plus className="h-5 w-5" />
              New Course
            </Button>
          </div>
        </div>

        {/* Search and Controls Row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search courses and groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-xl"
            />
          </div>
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl">
            <Filter className="h-5 w-5" />
          </Button>
          <div className="flex items-center border rounded-xl overflow-hidden">
            <Button
              variant={viewMode === "card" ? "default" : "ghost"}
              size="icon"
              className="h-12 w-12 rounded-none"
              onClick={() => setViewMode("card")}
            >
              <LayoutGrid className="h-5 w-5" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              className="h-12 w-12 rounded-none"
              onClick={() => setViewMode("list")}
            >
              <List className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Groups Section */}
        {filteredGroups.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Groups
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in">
              {filteredGroups.map((group) => (
                <CourseGroupCard
                  key={group.id}
                  group={group}
                  courses={courses}
                  onOpen={handleOpenGroup}
                  onEdit={handleEditGroup}
                  onDelete={handleDeleteGroup}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                />
              ))}
            </div>
          </div>
        )}

        {/* Courses Section */}
        {filteredCourses.length === 0 && filteredGroups.length === 0 ? (
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
        ) : filteredCourses.length > 0 && (
          <>
            {filteredGroups.length > 0 && (
              <h2 className="text-lg font-semibold text-foreground mb-4">All Courses</h2>
            )}
            {viewMode === "card" ? (
              /* Card View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, course.id)}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <CourseCard
                      course={course}
                      onEdit={handleEditCourse}
                      onPreview={handlePreviewCourse}
                      onDuplicate={handleDuplicateCourse}
                      onTogglePublish={handleTogglePublish}
                      onDelete={handleDeleteClick}
                      onVersionControl={handleVersionControl}
                    />
                  </div>
                ))}
              </div>
            ) : (
              /* List View */
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
                      <tr 
                        key={course.id} 
                        className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                        draggable
                        onDragStart={(e) => handleDragStart(e, course.id)}
                      >
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
                              <DropdownMenuItem onClick={() => handleEditCourse(course)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicateCourse(course.id)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleVersionControl(course.id)}>
                                <GitBranch className="h-4 w-4 mr-2" />
                                Version Control
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
          </>
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

      {/* Group Dialogs */}
      <CreateGroupDialog
        open={createGroupOpen}
        onOpenChange={setCreateGroupOpen}
        onCreateGroup={handleCreateGroup}
      />

      <GroupDetailPanel
        group={selectedGroup}
        courses={courses}
        open={groupDetailOpen}
        onOpenChange={setGroupDetailOpen}
        onUpdateGroup={handleUpdateGroup}
        onRemoveCourseFromGroup={handleRemoveCourseFromGroup}
        onEditCourse={handleEditCourse}
        onPreviewCourse={handlePreviewCourse}
        onDuplicateCourse={handleDuplicateCourse}
        onTogglePublish={handleTogglePublish}
        onDeleteCourse={handleDeleteClick}
      />

      {/* Version Control Dialog */}
      {versionControlCourseId && (
        <VersionControlDialog
          open={versionControlOpen}
          onOpenChange={setVersionControlOpen}
          course={courses.find((c) => c.id === versionControlCourseId)!}
          versions={getVersions(versionControlCourseId)}
          currentVersionId={getCurrentVersionId(versionControlCourseId)}
          onRestoreVersion={handleRestoreVersion}
          onBranchFromVersion={handleBranchFromVersion}
          onEditVersion={handleEditVersion}
        />
      )}
    </div>
  );
}
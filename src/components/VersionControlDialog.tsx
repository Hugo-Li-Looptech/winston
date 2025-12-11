import { useState } from "react";
import { CourseVersion, Course, Slide, CourseItem } from "@/types/course";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VersionGraph } from "./VersionGraph";
import { VersionCompare } from "./VersionCompare";
import { 
  Edit, 
  GitBranch, 
  RotateCcw, 
  ChevronLeft,
  ChevronRight,
  FileText,
  ClipboardCheck,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface VersionControlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course;
  versions: CourseVersion[];
  currentVersionId?: string;
  onRestoreVersion: (versionId: string) => void;
  onBranchFromVersion: (versionId: string) => void;
  onEditVersion: (versionId: string) => void;
}

export function VersionControlDialog({
  open,
  onOpenChange,
  course,
  versions,
  currentVersionId,
  onRestoreVersion,
  onBranchFromVersion,
  onEditVersion,
}: VersionControlDialogProps) {
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    versions.length > 0 ? versions[versions.length - 1].id : null
  );
  const [previewSlideIndex, setPreviewSlideIndex] = useState(0);

  const selectedVersion = versions.find((v) => v.id === selectedVersionId);
  const currentVersion = versions.find((v) => v.id === currentVersionId) || versions[versions.length - 1];

  const handleRestore = () => {
    if (selectedVersionId) {
      onRestoreVersion(selectedVersionId);
      toast({
        title: "Version restored",
        description: `Restored to "${selectedVersion?.versionName}"`,
      });
      onOpenChange(false);
    }
  };

  const handleBranch = () => {
    if (selectedVersionId) {
      onBranchFromVersion(selectedVersionId);
      toast({
        title: "Branch created",
        description: `Created new branch from "${selectedVersion?.versionName}"`,
      });
      // Don't close dialog - user can see the new branch in the tree
    }
  };

  const handleEdit = () => {
    if (selectedVersionId) {
      onEditVersion(selectedVersionId);
      onOpenChange(false);
    }
  };

  const slides = selectedVersion?.courseSnapshot.slides || [];
  const courseItems = selectedVersion?.courseSnapshot.courseItems || [];
  const assessmentCount = courseItems.filter((i) => i.type === "assessment").length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[80vh] p-0 gap-0">
        <DialogHeader className="px-6 py-3 border-b">
          <DialogTitle className="flex items-center gap-2 text-base">
            <GitBranch className="h-4 w-4" />
            Version Control - {course.title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Version Graph */}
          <div className="w-[280px] border-r flex flex-col bg-muted/30">
            <div className="p-3 border-b bg-card">
              <h3 className="text-sm font-medium">Version History</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {versions.length} version{versions.length !== 1 ? "s" : ""}
              </p>
            </div>
            <ScrollArea className="flex-1">
              <VersionGraph
                versions={versions}
                selectedVersionId={selectedVersionId}
                onSelectVersion={setSelectedVersionId}
                currentVersionId={currentVersionId}
              />
            </ScrollArea>
          </div>

          {/* Right Panel - Preview/Compare */}
          <div className="flex-1 flex flex-col">
            <Tabs defaultValue="preview" className="flex-1 flex flex-col">
              <div className="px-4 pt-3 border-b">
                <TabsList className="w-auto">
                  <TabsTrigger value="preview" className="gap-1.5">
                    <FileText className="h-4 w-4" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="compare" className="gap-1.5">
                    <ClipboardCheck className="h-4 w-4" />
                    Compare
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
                {selectedVersion ? (
                  <div className="h-full flex flex-col">
                    {/* Version info header */}
                    <div className="p-4 border-b bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{selectedVersion.versionName}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {slides.length} slides • {assessmentCount} assessments
                          </p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <div>{new Date(selectedVersion.timestamp).toLocaleDateString()}</div>
                          <div>by {selectedVersion.author}</div>
                        </div>
                      </div>
                    </div>

                    {/* Slide preview */}
                    <div className="flex-1 p-4 overflow-hidden">
                      {slides.length > 0 ? (
                        <div className="h-full flex flex-col">
                          {/* Slide content */}
                          <div className="flex-1 bg-card rounded-xl border p-6 overflow-auto">
                            <h3 className="text-lg font-semibold mb-3">
                              {slides[previewSlideIndex]?.title}
                            </h3>
                            <div className="space-y-2 mb-4">
                              {slides[previewSlideIndex]?.content.map((item, i) => (
                                <p key={i} className="text-sm text-muted-foreground">
                                  • {item}
                                </p>
                              ))}
                            </div>
                            <div className="border-t pt-4 mt-4">
                              <h4 className="text-sm font-medium mb-2">Talk Points</h4>
                              <p className="text-sm text-muted-foreground">
                                {slides[previewSlideIndex]?.talkPoints}
                              </p>
                            </div>
                          </div>

                          {/* Slide navigation */}
                          <div className="flex items-center justify-center gap-4 mt-4">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setPreviewSlideIndex((i) => Math.max(0, i - 1))}
                              disabled={previewSlideIndex === 0}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm text-muted-foreground">
                              Slide {previewSlideIndex + 1} of {slides.length}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                setPreviewSlideIndex((i) => Math.min(slides.length - 1, i + 1))
                              }
                              disabled={previewSlideIndex === slides.length - 1}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                          No slides in this version
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Select a version to preview
                  </div>
                )}
              </TabsContent>

              <TabsContent value="compare" className="flex-1 m-0 overflow-hidden">
                {selectedVersion && currentVersion ? (
                  <VersionCompare
                    selectedVersion={selectedVersion}
                    currentVersion={currentVersion}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Select a version to compare
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Action buttons */}
            <div className="p-4 border-t bg-muted/30 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleRestore}
                disabled={!selectedVersionId || selectedVersionId === currentVersionId}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Restore
              </Button>
              <Button
                variant="outline"
                onClick={handleBranch}
                disabled={!selectedVersionId}
                className="gap-2"
              >
                <GitBranch className="h-4 w-4" />
                Copy as Branch
              </Button>
              <Button
                onClick={handleEdit}
                disabled={!selectedVersionId}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

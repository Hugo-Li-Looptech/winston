import { useState } from "react";
import { CourseVersion, Course, Slide, CourseItem } from "@/types/course";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VersionGraph } from "./VersionGraph";
import { VersionCompare } from "./VersionCompare";
import { Edit, GitBranch, RotateCcw, ChevronLeft, ChevronRight, FileText, ClipboardCheck } from "lucide-react";
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
  onEditVersion
}: VersionControlDialogProps) {
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(versions.length > 0 ? versions[versions.length - 1].id : null);
  const [previewSlideIndex, setPreviewSlideIndex] = useState(0);
  const selectedVersion = versions.find(v => v.id === selectedVersionId);
  const currentVersion = versions.find(v => v.id === currentVersionId) || versions[versions.length - 1];
  const handleRestore = () => {
    if (selectedVersionId) {
      onRestoreVersion(selectedVersionId);
      toast({
        title: "Version restored",
        description: `Restored to "${selectedVersion?.versionName}"`
      });
      onOpenChange(false);
    }
  };
  const handleBranch = () => {
    if (selectedVersionId) {
      onBranchFromVersion(selectedVersionId);
      toast({
        title: "Branch created",
        description: `Created new branch from "${selectedVersion?.versionName}"`
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
  const assessmentCount = courseItems.filter(i => i.type === "assessment").length;
  return <Dialog open={open} onOpenChange={onOpenChange}>
 <DialogContent className="max-w-5xl h-[80vh] p-0 gap-0 flex flex-col">
  <DialogHeader className="px-4 py-1.5 border-b shrink-0">
    <DialogTitle className="flex items-center gap-2 text-sm font-medium">
      <GitBranch className="h-3.5 w-3.5" />
      Version Control - {course.title}
    </DialogTitle>
  </DialogHeader>

  <div className="flex flex-1 overflow-hidden">
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
              <div className="px-3 py-2 border-b">
                <TabsList className="h-8">
                  <TabsTrigger value="preview" className="gap-1.5 text-xs h-7">
                    <FileText className="h-3.5 w-3.5" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="compare" className="gap-1.5 text-xs h-7">
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    Compare
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
                {selectedVersion ? <div className="h-full flex flex-col">
                    {/* Compact version info header */}
                    <div className="px-3 py-2 border-b bg-muted/30 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{selectedVersion.versionName}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground text-xs">{slides.length} slides • {assessmentCount} assessments</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(selectedVersion.timestamp).toLocaleDateString()} by {selectedVersion.author}
                      </span>
                    </div>

                    {/* Slide preview */}
                    <div className="flex-1 p-3 overflow-hidden">
                      {slides.length > 0 ? <div className="h-full flex flex-col">
                          {/* Slide content */}
                          <div className="flex-1 bg-card rounded-lg border p-4 overflow-auto">
                            <h3 className="text-base font-semibold mb-2">
                              {slides[previewSlideIndex]?.title}
                            </h3>
                            <div className="space-y-1.5 mb-3">
                              {slides[previewSlideIndex]?.content.map((item, i) => <p key={i} className="text-sm text-muted-foreground">
                                  • {item}
                                </p>)}
                            </div>
                            <div className="border-t pt-3 mt-3">
                              <h4 className="text-xs font-medium mb-1.5 text-muted-foreground">Talk Points</h4>
                              <p className="text-sm text-muted-foreground">
                                {slides[previewSlideIndex]?.talkPoints}
                              </p>
                            </div>
                          </div>

                          {/* Slide thumbnail carousel */}
                          <div className="mt-3 flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setPreviewSlideIndex(i => Math.max(0, i - 1))} disabled={previewSlideIndex === 0}>
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex-1 overflow-x-auto">
                              <div className="flex gap-1.5 justify-center">
                                {slides.map((slide, idx) => <button key={slide.id} onClick={() => setPreviewSlideIndex(idx)} className={`h-8 min-w-[2rem] px-2 rounded text-xs font-medium transition-colors ${idx === previewSlideIndex ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}>
                                    {idx + 1}
                                  </button>)}
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setPreviewSlideIndex(i => Math.min(slides.length - 1, i + 1))} disabled={previewSlideIndex === slides.length - 1}>
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div> : <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                          No slides in this version
                        </div>}
                    </div>
                  </div> : <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    Select a version to preview
                  </div>}
              </TabsContent>

              <TabsContent value="compare" className="flex-1 m-0 overflow-hidden">
                {selectedVersion && currentVersion ? <VersionCompare selectedVersion={selectedVersion} currentVersion={currentVersion} /> : <div className="h-full flex items-center justify-center text-muted-foreground">
                    Select a version to compare
                  </div>}
              </TabsContent>
            </Tabs>

            {/* Action buttons */}
            <div className="px-3 py-2 border-t bg-muted/30 flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleRestore} disabled={!selectedVersionId || selectedVersionId === currentVersionId} className="gap-1.5 h-8 text-xs">
                <RotateCcw className="h-3.5 w-3.5" />
                Restore
              </Button>
              <Button variant="outline" size="sm" onClick={handleBranch} disabled={!selectedVersionId} className="gap-1.5 h-8 text-xs">
                <GitBranch className="h-3.5 w-3.5" />
                Copy as Branch
              </Button>
              <Button size="sm" onClick={handleEdit} disabled={!selectedVersionId} className="gap-1.5 h-8 text-xs">
                <Edit className="h-3.5 w-3.5" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
}
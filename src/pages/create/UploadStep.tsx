import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Trash2, CheckCircle, Plus, Loader2, AlertCircle } from "lucide-react";
import { useCourse } from "@/contexts/CourseContext";
import { SlideFile } from "@/types/course";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUploadDocument, usePollJobStatus } from "@/hooks/api";
import { toast } from "@/hooks/use-toast";

interface UploadStepProps {
  onContinue: () => void;
}

export function UploadStep({ onContinue }: UploadStepProps) {
  const { currentCourse, setSlideFiles, setSupplementFiles, setCourseTitle, setCourseDescription, markStepComplete } = useCourse();

  // API hooks for real upload
  const uploadDocument = useUploadDocument();
  const [uploadingFileId, setUploadingFileId] = useState<string | null>(null);
  const [processingJobId, setProcessingJobId] = useState<string | null>(null);

  // Store actual File objects for upload
  const pendingFilesRef = useRef<Map<string, File>>(new Map());

  const handleContinue = () => {
    markStepComplete('upload');
    onContinue();
  };
  const [isDraggingSlide, setIsDraggingSlide] = useState(false);
  const [isDraggingSupp, setIsDraggingSupp] = useState(false);

  const handleFileDrop = useCallback(
    async (files: FileList, isSlide: boolean) => {
      const fileArray = Array.from(files);

      if (isSlide) {
        // For slide files, upload to API
        for (const file of fileArray) {
          const fileId = Date.now().toString();

          // Create optimistic local entry with processing status
          const newFile: SlideFile = {
            id: fileId,
            name: file.name,
            type: file.type || "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            uploadedDate: new Date().toLocaleDateString(),
            status: "processing" as const,
            chunks: 0,
          };

          // Store the actual file for potential retry
          pendingFilesRef.current.set(fileId, file);
          setSlideFiles([...currentCourse.slideFiles, newFile]);
          setUploadingFileId(fileId);

          try {
            // Upload to API
            const result = await uploadDocument.mutateAsync({
              file,
              title: currentCourse.courseTitle || file.name.replace(/\.[^/.]+$/, ""),
              description: currentCourse.courseDescription,
            });

            // Update with successful status
            setSlideFiles((prev) =>
              prev.map((f) =>
                f.id === fileId
                  ? {
                      ...f,
                      status: "indexed" as const,
                      chunks: result.slideCount || 0,
                    }
                  : f
              )
            );

            setProcessingJobId(result.jobId);

            toast({
              title: "Upload successful",
              description: `${file.name} uploaded and processing started.`,
            });
          } catch (error) {
            // Update with error status
            setSlideFiles((prev) =>
              prev.map((f) =>
                f.id === fileId ? { ...f, status: "error" as const } : f
              )
            );

            toast({
              title: "Upload failed",
              description: error instanceof Error ? error.message : "Failed to upload file",
              variant: "destructive",
            });
          } finally {
            setUploadingFileId(null);
            pendingFilesRef.current.delete(fileId);
          }
        }
      } else {
        // For supplement files, keep local-only for now (no API endpoint)
        const newFiles: SlideFile[] = fileArray.map((file, index) => ({
          id: Date.now().toString() + index,
          name: file.name,
          type: file.type || "application/pdf",
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          uploadedDate: new Date().toLocaleDateString(),
          status: "indexed" as const,
          chunks: Math.floor(Math.random() * 50) + 20,
        }));

        setSupplementFiles([...currentCourse.supplementFiles, ...newFiles]);
      }
    },
    [
      currentCourse.slideFiles,
      currentCourse.supplementFiles,
      currentCourse.courseTitle,
      currentCourse.courseDescription,
      setSlideFiles,
      setSupplementFiles,
      uploadDocument,
    ],
  );

  const handleDrop = (e: React.DragEvent, isSlide: boolean) => {
    e.preventDefault();
    if (isSlide) setIsDraggingSlide(false);
    else setIsDraggingSupp(false);

    if (e.dataTransfer.files.length > 0) {
      handleFileDrop(e.dataTransfer.files, isSlide);
    }
  };

  const handleBrowse = (isSlide: boolean) => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = !isSlide;
    input.accept = ".pdf,.ppt,.pptx,.doc,.docx";
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) handleFileDrop(files, isSlide);
    };
    input.click();
  };

  const removeFile = (id: string, isSlide: boolean) => {
    if (isSlide) {
      setSlideFiles(currentCourse.slideFiles.filter((f) => f.id !== id));
    } else {
      setSupplementFiles(currentCourse.supplementFiles.filter((f) => f.id !== id));
    }
  };

  const hasSlideFile = currentCourse.slideFiles.length > 0;
  const hasSupplementFiles = currentCourse.supplementFiles.length > 0;
  const hasTitle = currentCourse.courseTitle.trim().length > 0;
  const hasProcessingFile = currentCourse.slideFiles.some((f) => f.status === "processing");

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Course Information Section */}
      <div className="bg-card rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b bg-muted/30">
          <h3 className="text-lg font-semibold text-foreground">Course Information</h3>
          <p className="text-sm text-muted-foreground mt-1">Set up your course title and description</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Course Title <span className="text-destructive">*</span>
            </label>
            <Input
              value={currentCourse.courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              placeholder="Enter your course title..."
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <Textarea
              value={currentCourse.courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
              placeholder="Briefly describe what learners will gain from this course..."
              className="rounded-xl resize-none min-h-[80px]"
            />
          </div>
        </div>
      </div>
      {/* Main Slide File Section */}
      <div className="bg-card rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b bg-muted/30">
          <h3 className="text-lg font-semibold text-foreground">Main Slide File</h3>
          <p className="text-sm text-muted-foreground mt-1">Upload your presentation slides</p>
        </div>

        {!hasSlideFile ? (
          <div
            className={`m-6 flex flex-col items-center justify-center h-60 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
              isDraggingSlide
                ? "border-primary bg-primary/5 border-solid"
                : "border-border border-solid hover:border-primary hover:bg-muted/30"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingSlide(true);
            }}
            onDragLeave={() => setIsDraggingSlide(false)}
            onDrop={(e) => handleDrop(e, true)}
            onClick={() => handleBrowse(true)}
          >
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Upload className="h-7 w-7 text-primary" />
            </div>
            <span className="text-base font-medium text-foreground">Drop Slide Files</span>
            <span className="text-sm text-muted-foreground mt-1">Drag & Drop or Browse and Select Slide Files*</span>
            <Button variant="outline" className="mt-4 rounded-xl">
              Browse
            </Button>
          </div>
        ) : (
          <div className="p-6">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="text-muted-foreground font-medium">Document</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Type</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Size</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Uploaded</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Chunks</TableHead>
                  <TableHead className="text-muted-foreground font-medium w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentCourse.slideFiles.map((file) => (
                  <TableRow key={file.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium text-foreground truncate max-w-[200px]">{file.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{file.type}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{file.size}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{file.uploadedDate}</TableCell>
                    <TableCell>
                      {file.status === "processing" ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Processing
                        </span>
                      ) : file.status === "error" ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-destructive bg-destructive/10 px-2.5 py-1 rounded-full">
                          <AlertCircle className="h-3 w-3" />
                          Error
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                          <CheckCircle className="h-3 w-3" />
                          Indexed
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{file.chunks}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(file.id, true)}
                        disabled={file.status === "processing"}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Supplement Files Section */}
      <div className="bg-card rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b bg-muted/30">
          <h3 className="text-lg font-semibold text-foreground">Supplement Files</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Winston can refer to these files to better respond to user's questions
          </p>
        </div>

        {!hasSupplementFiles ? (
          <div
            className={`m-6 flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
              isDraggingSupp ? "border-primary bg-primary/5" : "border-border hover:border-primary hover:bg-muted/30"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingSupp(true);
            }}
            onDragLeave={() => setIsDraggingSupp(false)}
            onDrop={(e) => handleDrop(e, false)}
            onClick={() => handleBrowse(false)}
          >
            <span className="text-base font-medium text-foreground">Upload Supplement Files</span>
            <span className="text-sm text-muted-foreground mt-1">Add documents, images, or other resources</span>
            <Button variant="outline" className="mt-3 rounded-xl">
              Browse
            </Button>
          </div>
        ) : (
          <div className="p-6">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="text-muted-foreground font-medium">Document</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Type</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Size</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Uploaded</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Chunks</TableHead>
                  <TableHead className="text-muted-foreground font-medium w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentCourse.supplementFiles.map((file) => (
                  <TableRow key={file.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium text-foreground truncate max-w-[200px]">{file.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{file.type}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{file.size}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{file.uploadedDate}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                        <CheckCircle className="h-3 w-3" />
                        Indexed
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{file.chunks}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(file.id, false)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Add More Button */}
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleBrowse(false)}
                className="h-10 w-10 rounded-full border-dashed"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Continue Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={handleContinue}
          disabled={!hasSlideFile || !hasTitle || uploadDocument.isPending || hasProcessingFile}
          size="lg"
          className="rounded-xl px-12"
        >
          {uploadDocument.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </div>
  );
}

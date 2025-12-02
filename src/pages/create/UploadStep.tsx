import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, File, Trash2, CheckCircle, Plus } from 'lucide-react';
import { useCourse } from '@/contexts/CourseContext';
import { SlideFile } from '@/types/course';

interface UploadStepProps {
  onContinue: () => void;
}

export function UploadStep({ onContinue }: UploadStepProps) {
  const { currentCourse, setSlideFiles, setSupplementFiles } = useCourse();
  const [isDraggingSlide, setIsDraggingSlide] = useState(false);
  const [isDraggingSupp, setIsDraggingSupp] = useState(false);

  const handleFileDrop = useCallback(
    (files: FileList, isSlide: boolean) => {
      const newFiles: SlideFile[] = Array.from(files).map((file, index) => ({
        id: Date.now().toString() + index,
        name: file.name,
        type: file.type || 'application/pdf',
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedDate: new Date().toLocaleDateString(),
        status: 'indexed' as const,
        chunks: Math.floor(Math.random() * 50) + 20,
      }));

      if (isSlide) {
        setSlideFiles([...currentCourse.slideFiles, ...newFiles]);
      } else {
        setSupplementFiles([...currentCourse.supplementFiles, ...newFiles]);
      }
    },
    [currentCourse.slideFiles, currentCourse.supplementFiles, setSlideFiles, setSupplementFiles]
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
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = !isSlide;
    input.accept = '.pdf,.ppt,.pptx,.doc,.docx';
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

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground">Upload Your Content</h2>
        <p className="text-muted-foreground mt-2">Start by uploading your presentation slides</p>
      </div>

      {/* Main Slide File Upload */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Presentation Slides <span className="text-destructive">*</span>
        </label>
        
        {!hasSlideFile ? (
          <div
            className={`flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
              isDraggingSlide ? 'border-primary bg-primary/5' : 'border-border hover:border-primary hover:bg-muted/50'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingSlide(true);
            }}
            onDragLeave={() => setIsDraggingSlide(false)}
            onDrop={(e) => handleDrop(e, true)}
            onClick={() => handleBrowse(true)}
          >
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-3">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">Click to upload or drag & drop</span>
            <span className="text-xs text-muted-foreground mt-1">PPTX, PPT, PDF, KEY</span>
          </div>
        ) : (
          <div className="bg-card rounded-xl border overflow-hidden">
            {currentCourse.slideFiles.map((file) => (
              <div key={file.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <File className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{file.size} • {file.uploadedDate}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                    <CheckCircle className="h-3 w-3" />
                    Indexed
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.id, true)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Supplement Files Upload */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Supplementary Materials
          <span className="text-muted-foreground font-normal ml-2">(optional)</span>
        </label>
        
        <div
          className={`flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
            isDraggingSupp ? 'border-primary bg-primary/5' : 'border-border hover:border-primary hover:bg-muted/50'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingSupp(true);
          }}
          onDragLeave={() => setIsDraggingSupp(false)}
          onDrop={(e) => handleDrop(e, false)}
          onClick={() => handleBrowse(false)}
        >
          <span className="text-sm text-muted-foreground">Add documents, images, or other resources</span>
        </div>

        {currentCourse.supplementFiles.length > 0 && (
          <div className="space-y-2 mt-4">
            {currentCourse.supplementFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl"
              >
                <File className="h-5 w-5 text-muted-foreground shrink-0" />
                <span className="text-sm text-foreground truncate flex-1">{file.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeFile(file.id, false)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={onContinue}
          disabled={!hasSlideFile}
          size="lg"
          className="rounded-xl px-8"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

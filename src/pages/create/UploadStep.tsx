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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Upload File</h2>

      {/* Main Slide File Upload */}
      {!hasSlideFile ? (
        <div
          className={`border-2 border-foreground p-8 transition-colors ${
            isDraggingSlide ? 'bg-secondary' : 'bg-card'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingSlide(true);
          }}
          onDragLeave={() => setIsDraggingSlide(false)}
          onDrop={(e) => handleDrop(e, true)}
        >
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="h-16 w-16 bg-secondary flex items-center justify-center">
              <Upload className="h-8 w-8" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold">Drop Slide Files</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Drag & Drop or Browse and Select Slide Files*
              </p>
            </div>
            <Button variant="outline" onClick={() => handleBrowse(true)}>
              Browse
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-foreground bg-card">
          <div className="p-4 border-b border-foreground">
            <h3 className="font-semibold">Main Slide File</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left p-3">Document</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Size</th>
                <th className="text-left p-3">Uploaded</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Chunks</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentCourse.slideFiles.map((file) => (
                <tr key={file.id} className="border-t border-muted">
                  <td className="p-3 flex items-center gap-2">
                    <File className="h-4 w-4 text-destructive" />
                    {file.name}
                  </td>
                  <td className="p-3 text-muted-foreground">{file.type}</td>
                  <td className="p-3">{file.size}</td>
                  <td className="p-3">{file.uploadedDate}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1">
                      <CheckCircle className="h-3 w-3" />
                      Indexed
                    </span>
                  </td>
                  <td className="p-3">{file.chunks}</td>
                  <td className="p-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(file.id, true)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Supplement Files Upload */}
      <div
        className={`border-2 border-dashed border-foreground p-8 transition-colors ${
          isDraggingSupp ? 'bg-secondary' : 'bg-card'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingSupp(true);
        }}
        onDragLeave={() => setIsDraggingSupp(false)}
        onDrop={(e) => handleDrop(e, false)}
      >
        {currentCourse.supplementFiles.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="h-16 w-16 bg-secondary flex items-center justify-center">
              <Upload className="h-8 w-8" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold">Upload Supplement Files</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Winston can refer to these files and better respond to user's questions.
              </p>
              <p className="text-xs text-muted-foreground">
                Acceptable files: pdf, word, ppt etc.
              </p>
            </div>
            <Button variant="outline" onClick={() => handleBrowse(false)}>
              Browse
            </Button>
          </div>
        ) : (
          <div>
            <h3 className="font-semibold mb-4">Supp Files</h3>
            <table className="w-full text-sm">
              <thead className="bg-secondary">
                <tr>
                  <th className="text-left p-3">Document</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Size</th>
                  <th className="text-left p-3">Uploaded</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Chunks</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentCourse.supplementFiles.map((file) => (
                  <tr key={file.id} className="border-t border-muted">
                    <td className="p-3 flex items-center gap-2">
                      <File className="h-4 w-4 text-destructive" />
                      {file.name}
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">{file.type}</td>
                    <td className="p-3">{file.size}</td>
                    <td className="p-3">{file.uploadedDate}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1">
                        <CheckCircle className="h-3 w-3" />
                        Indexed
                      </span>
                    </td>
                    <td className="p-3">{file.chunks}</td>
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(file.id, false)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-center mt-4">
              <Button variant="outline" size="icon" onClick={() => handleBrowse(false)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <Button onClick={onContinue} disabled={!hasSlideFile} className="w-32">
          Continue
        </Button>
      </div>
    </div>
  );
}

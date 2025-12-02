import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Plus, Search, Grid, List, Filter, FolderOpen } from 'lucide-react';
import { useCourse } from '@/contexts/CourseContext';
import { AIAssistant } from '@/components/AIAssistant';
import { Course } from '@/types/course';

export default function Dashboard() {
  const navigate = useNavigate();
  const { courses, resetCurrentCourse } = useCourse();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateCourse = () => {
    resetCurrentCourse();
    navigate('/create');
  };

  const getStatusBadge = (status: Course['status']) => {
    const variants: Record<Course['status'], string> = {
      published: 'bg-primary text-primary-foreground',
      pending: 'bg-secondary text-secondary-foreground border border-foreground',
      in_progress: 'bg-accent text-accent-foreground border border-foreground',
    };
    const labels: Record<Course['status'], string> = {
      published: 'Published',
      pending: 'Pending',
      in_progress: 'In Progress',
    };
    return <span className={`px-3 py-1 text-sm font-medium ${variants[status]}`}>{labels[status]}</span>;
  };

  const getProgressDisplay = (progress: Course['progress']) => {
    const labels: Record<Course['progress'], string> = {
      '100%': '100%',
      '0%': '0%',
      slides_uploaded: 'Slides Uploaded',
      wizard_complete: 'Wizard Complete',
      setting_talk_points: 'Setting Talk Points',
      awaiting_preview: 'Awaiting Preview',
    };
    return <span className="text-sm text-muted-foreground bg-secondary px-3 py-1">{labels[progress]}</span>;
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isEmpty = courses.length === 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-2 border-foreground px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-secondary border-2 border-foreground flex items-center justify-center">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>
          <Button onClick={handleCreateCourse} className="gap-2">
            <Plus className="h-4 w-4" />
            Create
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {isEmpty ? (
          /* Empty State */
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="border-2 border-foreground p-12 text-center">
              <div className="h-24 w-24 bg-secondary rounded-full mx-auto mb-6 flex items-center justify-center">
                <FolderOpen className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-4">No Course</h2>
              <Button variant="outline" onClick={handleCreateCourse}>
                How to Start a Course
              </Button>
            </div>
          </div>
        ) : (
          /* Course List */
          <div className="space-y-6">
            {/* Search and Controls */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Bar"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="border-2 border-foreground">
              <table className="w-full">
                <thead className="border-b-2 border-foreground">
                  <tr>
                    <th className="text-left p-4 font-semibold">Course Title</th>
                    <th className="text-left p-4 font-semibold">Date</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Progress</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((course, index) => (
                    <tr
                      key={course.id}
                      className={index !== filteredCourses.length - 1 ? 'border-b border-muted' : ''}
                    >
                      <td className="p-4 font-medium">{course.title}</td>
                      <td className="p-4">{course.date}</td>
                      <td className="p-4">{getStatusBadge(course.status)}</td>
                      <td className="p-4">{getProgressDisplay(course.progress)}</td>
                      <td className="p-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate('/create')}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <AIAssistant />
    </div>
  );
}

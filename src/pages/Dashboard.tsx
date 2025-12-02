import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, MoreHorizontal, GraduationCap, LogOut, FolderOpen } from 'lucide-react';
import { useCourse } from '@/contexts/CourseContext';
import { AIAssistant } from '@/components/AIAssistant';
import { Course } from '@/types/course';

export default function Dashboard() {
  const navigate = useNavigate();
  const { courses, resetCurrentCourse } = useCourse();
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateCourse = () => {
    resetCurrentCourse();
    navigate('/create');
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: Course['status']) => {
    const styles: Record<Course['status'], string> = {
      published: 'bg-primary/10 text-primary',
      pending: 'bg-muted text-muted-foreground',
      in_progress: 'bg-accent text-accent-foreground',
    };
    const labels: Record<Course['status'], string> = {
      published: 'Published',
      pending: 'Pending',
      in_progress: 'In Progress',
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
            <span className="font-semibold text-foreground">CourseAI</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
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
            <p className="text-muted-foreground mb-6">Create your first course to get started</p>
            <Button onClick={handleCreateCourse} className="rounded-xl">
              Create Course
            </Button>
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
                            style={{ width: course.progress === '100%' ? '100%' : course.progress === '0%' ? '0%' : '50%' }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{course.progress}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <AIAssistant />
    </div>
  );
}

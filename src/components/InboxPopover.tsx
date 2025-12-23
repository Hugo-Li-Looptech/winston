import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox, MessageSquare, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCourse } from '@/contexts/CourseContext';

interface InboxComment {
  id: string;
  userName: string;
  content: string;
  timestamp: Date;
  courseId: string;
  courseTitle: string;
  slideId?: string;
  resolved: boolean;
}

export function InboxPopover() {
  const navigate = useNavigate();
  const { courses, comments } = useCourse();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Get comments from all courses with course info attached
  const allComments: InboxComment[] = comments
    .filter((c) => !c.resolved) // Only show unresolved in inbox
    .map((comment) => {
      // Find which course this comment belongs to (for demo, we'll use the first course)
      const course = courses[0];
      return {
        ...comment,
        courseId: course?.id || '',
        courseTitle: course?.title || 'Unknown Course',
      };
    });

  const unreadCount = allComments.length;

  const formatDate = (date: Date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffDays = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return commentDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    }
    return commentDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleGoToComment = (comment: InboxComment) => {
    setOpen(false);
    // Navigate to the course editor with the specific slide
    navigate(`/create?mode=edit&step=scripting&courseId=${comment.courseId}${comment.slideId ? `&slideId=${comment.slideId}` : ''}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Inbox className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-medium flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm text-foreground">Inbox</h3>
            {unreadCount > 0 && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 px-3 py-2 border-b bg-muted/30">
          {(['all', 'unread'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {f === 'all' ? 'All' : 'Unread'}
            </button>
          ))}
        </div>

        {/* Comments List */}
        <ScrollArea className="max-h-80">
          <div className="p-2">
            {allComments.length === 0 ? (
              <div className="text-center py-8">
                <Inbox className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No new comments</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Comments from your courses will appear here
                </p>
              </div>
            ) : (
              allComments.map((comment) => (
                <button
                  key={comment.id}
                  onClick={() => handleGoToComment(comment)}
                  className="w-full p-3 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {getInitials(comment.userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-foreground truncate">
                          {comment.userName}
                        </span>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {formatDate(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-primary font-medium mt-0.5 truncate">
                        {comment.courseTitle}
                        {comment.slideId && ` • Slide ${comment.slideId}`}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {comment.content}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        {allComments.length > 0 && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              className="w-full text-sm text-muted-foreground hover:text-foreground"
              onClick={() => {
                setOpen(false);
                // Could navigate to a dedicated inbox page
              }}
            >
              View all comments
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

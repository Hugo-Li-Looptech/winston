import { useState } from 'react';
import { X, Check, Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Comment } from '@/types/comment';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CommentsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  comments: Comment[];
  onAddComment: (content: string) => void;
  onResolveComment: (commentId: string) => void;
  currentSlideId?: string;
}

export function CommentsPanel({
  isOpen,
  onClose,
  comments,
  onAddComment,
  onResolveComment,
  currentSlideId,
}: CommentsPanelProps) {
  const [newComment, setNewComment] = useState('');
  const [filter, setFilter] = useState<'all' | 'current' | 'unresolved'>('all');

  const filteredComments = comments.filter((comment) => {
    if (filter === 'current' && currentSlideId) {
      return comment.slideId === currentSlideId;
    }
    if (filter === 'unresolved') {
      return !comment.resolved;
    }
    return true;
  });

  const handleSubmit = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-card border-l shadow-xl z-50 flex flex-col animate-in slide-in-from-right">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Comments</h3>
          <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
            {comments.length}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 px-4 py-2 border-b bg-muted/30">
        {(['all', 'current', 'unresolved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {f === 'all' ? 'All' : f === 'current' ? 'Current Slide' : 'Unresolved'}
          </button>
        ))}
      </div>

      {/* Comments List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {filteredComments.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No comments yet</p>
            </div>
          ) : (
            filteredComments.map((comment) => (
              <div
                key={comment.id}
                className={`p-3 rounded-xl border transition-colors ${
                  comment.resolved ? 'bg-muted/30 opacity-60' : 'bg-background'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {getInitials(comment.userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        {comment.userName}
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(comment.timestamp)}
                      </span>
                    </div>
                    {comment.slideId && (
                      <span className="text-xs text-primary">Slide {comment.slideId}</span>
                    )}
                    <p className="text-sm text-foreground mt-1">{comment.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => onResolveComment(comment.id)}
                      >
                        <Check className="h-3 w-3" />
                        {comment.resolved ? 'Resolved' : 'Mark Resolved'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Add Comment Input */}
      <div className="p-4 border-t bg-muted/30">
        <div className="relative">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-[80px] pr-12 resize-none rounded-xl"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button
            size="icon"
            className="absolute bottom-2 right-2 h-8 w-8 rounded-lg"
            onClick={handleSubmit}
            disabled={!newComment.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

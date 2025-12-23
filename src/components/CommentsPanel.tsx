import { useState } from 'react';
import { X, Check, Send, MessageSquare, AtSign, Reply, CornerDownRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Comment } from '@/types/comment';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CommentsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  comments: Comment[];
  onAddComment: (content: string, parentId?: string) => void;
  onResolveComment: (commentId: string) => void;
  currentSlideId?: string;
}

// Sample users for @mention
const sampleUsers = [
  { id: 'user-1', name: 'Sarah Chen' },
  { id: 'user-2', name: 'Mike Johnson' },
  { id: 'user-3', name: 'Emily Davis' },
  { id: 'user-4', name: 'Alex Turner' },
];

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
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

  const filteredComments = comments.filter((comment) => {
    if (filter === 'current' && currentSlideId) {
      return comment.slideId === currentSlideId;
    }
    if (filter === 'unresolved') {
      return !comment.resolved;
    }
    return true;
  });

  const filteredUsers = sampleUsers.filter((user) =>
    user.name.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  const handleSubmit = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim(), replyingTo?.id);
      setNewComment('');
      setReplyingTo(null);
    }
  };

  const handleCommentChange = (value: string) => {
    setNewComment(value);
    
    // Check for @ symbol to trigger mentions
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const textAfterAt = value.slice(lastAtIndex + 1);
      // Only show mentions if we're actively typing after @
      if (!textAfterAt.includes(' ') && lastAtIndex === value.length - 1 - textAfterAt.length) {
        setShowMentions(true);
        setMentionSearch(textAfterAt);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (userName: string) => {
    const lastAtIndex = newComment.lastIndexOf('@');
    const newValue = newComment.slice(0, lastAtIndex) + `@${userName} `;
    setNewComment(newValue);
    setShowMentions(false);
    setMentionSearch('');
  };

  const handleReplyClick = (comment: Comment) => {
    setReplyingTo(comment);
    setNewComment(`@${comment.userName} `);
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setNewComment('');
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

  // Render comment content with highlighted @mentions
  const renderCommentContent = (content: string) => {
    const parts = content.split(/(@\w+\s?\w*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="text-primary font-medium">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Render a single comment with its replies
  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment.id}
      className={`p-4 rounded-xl border transition-all cursor-pointer ${
        comment.resolved 
          ? 'bg-muted/20 border-border/50' 
          : 'bg-background border-border hover:border-primary/30 hover:shadow-sm'
      } ${isReply ? 'ml-8 mt-2' : ''}`}
      onClick={() => !isReply && handleReplyClick(comment)}
    >
      {isReply && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <CornerDownRight className="h-3 w-3" />
          <span>Reply</span>
        </div>
      )}
      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback 
            className={`text-xs font-medium ${
              comment.resolved 
                ? 'bg-muted text-muted-foreground' 
                : 'bg-primary/10 text-primary'
            }`}
          >
            {getInitials(comment.userName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={`text-sm font-medium truncate ${
              comment.resolved ? 'text-muted-foreground' : 'text-foreground'
            }`}>
              {comment.userName}
            </span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDate(comment.timestamp)}
            </span>
          </div>
          {comment.slideId && (
            <span className={`text-xs ${comment.resolved ? 'text-muted-foreground' : 'text-primary'}`}>
              Slide {comment.slideId}
            </span>
          )}
          <p className={`text-sm mt-1.5 leading-relaxed ${
            comment.resolved ? 'text-muted-foreground' : 'text-foreground'
          }`}>
            {renderCommentContent(comment.content)}
          </p>
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReplyClick(comment);
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <Reply className="h-3.5 w-3.5" />
              Reply
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onResolveComment(comment.id);
              }}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                comment.resolved
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Check className={`h-3.5 w-3.5 ${comment.resolved ? 'text-primary' : ''}`} />
              {comment.resolved ? 'Resolved' : 'Resolve'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
              <div key={comment.id}>
                {renderComment(comment)}
                {/* Render replies */}
                {comment.replies?.map((reply) => renderComment(reply, true))}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Add Comment Input */}
      <div className="p-4 border-t bg-muted/30">
        <div className="relative">
          {/* Reply indicator */}
          {replyingTo && (
            <div className="flex items-center justify-between mb-2 px-2 py-1.5 bg-primary/10 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Reply className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Replying to</span>
                <span className="font-medium text-foreground">{replyingTo.userName}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={cancelReply}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Mention suggestions dropdown */}
          {showMentions && filteredUsers.length > 0 && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-popover border rounded-lg shadow-lg overflow-hidden z-10">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleMentionSelect(user.name)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 transition-colors"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-foreground">{user.name}</span>
                </button>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-muted-foreground hover:text-primary"
              onClick={() => {
                setNewComment(newComment + '@');
                setShowMentions(true);
                setMentionSearch('');
              }}
            >
              <AtSign className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground">
              {replyingTo ? 'Type your reply...' : 'Click a comment to reply or use @ to mention'}
            </span>
          </div>
          
          <Textarea
            value={newComment}
            onChange={(e) => handleCommentChange(e.target.value)}
            placeholder={replyingTo ? `Reply to ${replyingTo.userName}...` : "Add a comment..."}
            className="min-h-[80px] pr-12 resize-none rounded-xl"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
              if (e.key === 'Escape' && replyingTo) {
                cancelReply();
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
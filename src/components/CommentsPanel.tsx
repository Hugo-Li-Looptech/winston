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
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyShowMentions, setReplyShowMentions] = useState(false);
  const [replyMentionSearch, setReplyMentionSearch] = useState('');

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

  const replyFilteredUsers = sampleUsers.filter((user) =>
    user.name.toLowerCase().includes(replyMentionSearch.toLowerCase())
  );

  const handleSubmit = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  const handleReplySubmit = (parentId: string) => {
    if (replyText.trim()) {
      onAddComment(replyText.trim(), parentId);
      setReplyText('');
      setReplyingToId(null);
      setReplyShowMentions(false);
    }
  };

  const handleCommentChange = (value: string) => {
    setNewComment(value);
    
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const textAfterAt = value.slice(lastAtIndex + 1);
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

  const handleReplyChange = (value: string) => {
    setReplyText(value);
    
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const textAfterAt = value.slice(lastAtIndex + 1);
      if (!textAfterAt.includes(' ') && lastAtIndex === value.length - 1 - textAfterAt.length) {
        setReplyShowMentions(true);
        setReplyMentionSearch(textAfterAt);
      } else {
        setReplyShowMentions(false);
      }
    } else {
      setReplyShowMentions(false);
    }
  };

  const handleMentionSelect = (userName: string) => {
    const lastAtIndex = newComment.lastIndexOf('@');
    const newValue = newComment.slice(0, lastAtIndex) + `@${userName} `;
    setNewComment(newValue);
    setShowMentions(false);
    setMentionSearch('');
  };

  const handleReplyMentionSelect = (userName: string) => {
    const lastAtIndex = replyText.lastIndexOf('@');
    const newValue = replyText.slice(0, lastAtIndex) + `@${userName} `;
    setReplyText(newValue);
    setReplyShowMentions(false);
    setReplyMentionSearch('');
  };

  const handleReplyClick = (comment: Comment) => {
    setReplyingToId(comment.id);
    setReplyText(`@${comment.userName} `);
  };

  const cancelReply = () => {
    setReplyingToId(null);
    setReplyText('');
    setReplyShowMentions(false);
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

  const renderReplyInput = (comment: Comment) => (
    <div className="mt-3 ml-12 relative">
      <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
        <Reply className="h-3.5 w-3.5 text-primary" />
        <span>Replying to <span className="font-medium text-foreground">{comment.userName}</span></span>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 ml-auto"
          onClick={cancelReply}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      
      {replyShowMentions && replyFilteredUsers.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-popover border rounded-lg shadow-lg overflow-hidden z-10">
          {replyFilteredUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => handleReplyMentionSelect(user.name)}
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
      
      <div className="relative">
        <Textarea
          value={replyText}
          onChange={(e) => handleReplyChange(e.target.value)}
          placeholder={`Reply to ${comment.userName}...`}
          className="min-h-[60px] pr-10 resize-none rounded-lg text-sm"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleReplySubmit(comment.id);
            }
            if (e.key === 'Escape') {
              cancelReply();
            }
          }}
        />
        <Button
          size="icon"
          className="absolute bottom-2 right-2 h-6 w-6 rounded-md"
          onClick={() => handleReplySubmit(comment.id)}
          disabled={!replyText.trim()}
        >
          <Send className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );

  const renderReply = (reply: Comment) => (
    <div
      key={reply.id}
      className="ml-10 mt-2 pl-4 border-l-2 border-primary/20"
    >
      <div className="flex items-start gap-2">
        <Avatar className="h-7 w-7">
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {getInitials(reply.userName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {reply.userName}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(reply.timestamp)}
            </span>
          </div>
          <p className="text-sm mt-0.5 text-foreground leading-relaxed">
            {renderCommentContent(reply.content)}
          </p>
        </div>
      </div>
    </div>
  );

  const renderComment = (comment: Comment) => (
    <div key={comment.id} className="space-y-1">
      <div
        className={`p-4 rounded-xl border transition-all ${
          comment.resolved 
            ? 'bg-muted/20 border-border/50' 
            : 'bg-background border-border'
        } ${replyingToId === comment.id ? 'ring-2 ring-primary/30' : ''}`}
      >
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
                onClick={() => handleReplyClick(comment)}
                className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                  replyingToId === comment.id
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                <Reply className="h-3.5 w-3.5" />
                Reply
              </button>
              <button
                onClick={() => onResolveComment(comment.id)}
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
        
        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-2">
            {comment.replies.map((reply) => renderReply(reply))}
          </div>
        )}
        
        {/* Inline reply input */}
        {replyingToId === comment.id && renderReplyInput(comment)}
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
            filteredComments.map((comment) => renderComment(comment))
          )}
        </div>
      </ScrollArea>

      {/* Add New Comment Input */}
      <div className="p-4 border-t bg-muted/30">
        <div className="relative">
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
              Use @ to mention someone
            </span>
          </div>
          
          <Textarea
            value={newComment}
            onChange={(e) => handleCommentChange(e.target.value)}
            placeholder="Add a new comment..."
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

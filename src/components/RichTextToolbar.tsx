import { Button } from '@/components/ui/button';
import { Bold, Italic, Underline, List, ListOrdered, Link } from 'lucide-react';

interface RichTextToolbarProps {
  onBold?: () => void;
  onItalic?: () => void;
  onUnderline?: () => void;
  onBulletList?: () => void;
  onNumberedList?: () => void;
  onLink?: () => void;
}

export function RichTextToolbar({
  onBold,
  onItalic,
  onUnderline,
  onBulletList,
  onNumberedList,
  onLink,
}: RichTextToolbarProps) {
  return (
    <div className="flex items-center gap-1 p-1.5 bg-muted/30 dark:bg-muted/20 rounded-xl w-fit transition-all duration-300 hover:bg-muted/40 dark:hover:bg-muted/30">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 rounded-lg"
        onClick={onBold}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 rounded-lg"
        onClick={onItalic}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 rounded-lg"
        onClick={onUnderline}
      >
        <Underline className="h-4 w-4" />
      </Button>
      <div className="w-px h-4 bg-border/30 mx-1.5" />
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 rounded-lg"
        onClick={onBulletList}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 rounded-lg"
        onClick={onNumberedList}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <div className="w-px h-4 bg-border/30 mx-1.5" />
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 rounded-lg"
        onClick={onLink}
      >
        <Link className="h-4 w-4" />
      </Button>
    </div>
  );
}

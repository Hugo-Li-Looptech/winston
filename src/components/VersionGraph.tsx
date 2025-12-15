import { useState } from "react";
import { CourseVersion } from "@/types/course";
import { cn } from "@/lib/utils";
import { GitBranch } from "lucide-react";

interface VersionGraphProps {
  versions: CourseVersion[];
  selectedVersionId: string | null;
  onSelectVersion: (versionId: string) => void;
  currentVersionId?: string;
}

interface VersionNode {
  version: CourseVersion;
  depth: number;
  branchIndex: number; // 0 = main line, 1+ = branch
  children: VersionNode[];
  isBranchStart: boolean;
}

function buildVersionTree(versions: CourseVersion[]): VersionNode[] {
  const versionMap = new Map<string, VersionNode>();
  const roots: VersionNode[] = [];

  // Create nodes for all versions
  versions.forEach((version) => {
    versionMap.set(version.id, { version, depth: 0, branchIndex: 0, children: [], isBranchStart: false });
  });

  // Build tree structure
  versions.forEach((version) => {
    const node = versionMap.get(version.id)!;
    if (version.parentVersionId) {
      const parent = versionMap.get(version.parentVersionId);
      if (parent) {
        // Check if parent already has a child (this makes it a branch)
        if (parent.children.length > 0) {
          node.isBranchStart = true;
          node.branchIndex = parent.children.length;
        }
        parent.children.push(node);
        node.depth = parent.depth + 1;
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}

// Flatten tree but group main line first, then branches
function flattenTreeGrouped(nodes: VersionNode[]): { version: CourseVersion; depth: number; branchIndex: number; isBranchStart: boolean; isLastInBranch: boolean }[] {
  const result: { version: CourseVersion; depth: number; branchIndex: number; isBranchStart: boolean; isLastInBranch: boolean }[] = [];
  
  function traverse(node: VersionNode, currentBranchIndex: number) {
    result.push({ 
      version: node.version, 
      depth: node.depth, 
      branchIndex: currentBranchIndex,
      isBranchStart: node.isBranchStart,
      isLastInBranch: node.children.length === 0
    });
    
    // First traverse main line (first child)
    if (node.children.length > 0) {
      traverse(node.children[0], currentBranchIndex);
    }
    
    // Then traverse branches
    for (let i = 1; i < node.children.length; i++) {
      traverse(node.children[i], i);
    }
  }
  
  nodes.forEach(root => traverse(root, 0));
  return result;
}

export function VersionGraph({ versions, selectedVersionId, onSelectVersion, currentVersionId }: VersionGraphProps) {
  const [hoveredVersionId, setHoveredVersionId] = useState<string | null>(null);
  const tree = buildVersionTree(versions);
  const flatList = flattenTreeGrouped(tree);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  if (versions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
        <GitBranch className="h-8 w-8 mb-2 opacity-50" />
        <p className="text-sm">No versions saved yet</p>
        <p className="text-xs mt-1">Save your course to create the first version</p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-0">
      {flatList.map((item, index) => {
        const { version, branchIndex, isBranchStart, isLastInBranch } = item;
        const isSelected = selectedVersionId === version.id;
        const isCurrent = currentVersionId === version.id;
        const isHovered = hoveredVersionId === version.id;
        const showDetails = isSelected || isHovered;
        const nextItem = flatList[index + 1];
        const hasLineBelow = nextItem && !nextItem.isBranchStart;

        return (
          <div
            key={version.id}
            className="relative flex items-start"
            onMouseEnter={() => setHoveredVersionId(version.id)}
            onMouseLeave={() => setHoveredVersionId(null)}
          >
            {/* Fixed-width timeline column for alignment */}
            <div className="relative flex items-center justify-center w-6 shrink-0">
              {/* Branch indicator line (horizontal) */}
              {isBranchStart && (
                <div className="absolute left-0 top-4 w-3 h-0.5 bg-border" />
              )}
              
              {/* Vertical line above */}
              {index > 0 && !isBranchStart && (
                <div className="absolute top-0 left-1/2 w-0.5 h-4 bg-border -translate-x-1/2" />
              )}
              
              {/* Node circle - clickable */}
              <button
                onClick={() => onSelectVersion(version.id)}
                className={cn(
                  "relative z-10 w-3.5 h-3.5 rounded-full border-2 transition-all mt-3 cursor-pointer",
                  isSelected
                    ? "bg-primary border-primary scale-125 ring-2 ring-primary/30"
                    : isCurrent
                    ? "bg-primary border-primary"
                    : "bg-background border-muted-foreground/40 hover:border-primary hover:scale-110"
                )}
                title={`Select ${version.versionName}`}
              />
              
              {/* Vertical line below */}
              {hasLineBelow && (
                <div className="absolute top-7 left-1/2 w-0.5 h-full bg-border -translate-x-1/2" />
              )}
              
              {/* Continuing line for branches */}
              {isBranchStart && (
                <div className="absolute top-0 left-0 w-0.5 h-full bg-border" />
              )}
            </div>

            {/* Version info */}
            <button
              onClick={() => onSelectVersion(version.id)}
              className={cn(
                "flex-1 text-left py-2 px-2 rounded-md transition-all min-h-[40px]",
                isSelected
                  ? "bg-primary/10 border border-primary/30"
                  : "hover:bg-muted/50 border border-transparent"
              )}
            >
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={cn(
                  "font-medium text-xs",
                  isSelected ? "text-primary" : "text-foreground"
                )}>
                  {version.versionName}
                </span>
                {version.isPublished && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 font-medium">
                    Published
                  </span>
                )}
                {isCurrent && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                    Current
                  </span>
                )}
              </div>
              {/* Expandable details on hover/select */}
              <div className={cn(
                "overflow-hidden transition-all duration-200",
                showDetails ? "max-h-12 opacity-100 mt-0.5" : "max-h-0 opacity-0"
              )}>
                <div className="text-[10px] text-muted-foreground">
                  {formatDate(version.timestamp)} at {formatTime(version.timestamp)}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  by {version.author}
                </div>
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
import { useState } from "react";
import { CourseVersion } from "@/types/course";
import { cn } from "@/lib/utils";
import { GitBranch, Circle } from "lucide-react";

interface VersionGraphProps {
  versions: CourseVersion[];
  selectedVersionId: string | null;
  onSelectVersion: (versionId: string) => void;
  currentVersionId?: string;
}

interface VersionNode {
  version: CourseVersion;
  depth: number;
  children: VersionNode[];
}

function buildVersionTree(versions: CourseVersion[]): VersionNode[] {
  const versionMap = new Map<string, VersionNode>();
  const roots: VersionNode[] = [];

  // Create nodes for all versions
  versions.forEach((version) => {
    versionMap.set(version.id, { version, depth: 0, children: [] });
  });

  // Build tree structure
  versions.forEach((version) => {
    const node = versionMap.get(version.id)!;
    if (version.parentVersionId) {
      const parent = versionMap.get(version.parentVersionId);
      if (parent) {
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

function flattenTree(nodes: VersionNode[], result: { version: CourseVersion; depth: number; hasBranch: boolean }[] = []): { version: CourseVersion; depth: number; hasBranch: boolean }[] {
  nodes.forEach((node) => {
    result.push({ version: node.version, depth: node.depth, hasBranch: node.children.length > 1 });
    flattenTree(node.children, result);
  });
  return result;
}

export function VersionGraph({ versions, selectedVersionId, onSelectVersion, currentVersionId }: VersionGraphProps) {
  const [hoveredVersionId, setHoveredVersionId] = useState<string | null>(null);
  const tree = buildVersionTree(versions);
  const flatList = flattenTree(tree);

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
    <div className="p-3 space-y-0.5">
      {flatList.map((item, index) => {
        const { version, depth, hasBranch } = item;
        const isSelected = selectedVersionId === version.id;
        const isCurrent = currentVersionId === version.id;
        const isLast = index === flatList.length - 1;
        const isHovered = hoveredVersionId === version.id;
        const showDetails = isSelected || isHovered;

        return (
          <div
            key={version.id}
            className="relative flex items-start gap-2"
            style={{ paddingLeft: depth * 12 }}
            onMouseEnter={() => setHoveredVersionId(version.id)}
            onMouseLeave={() => setHoveredVersionId(null)}
          >
            {/* Timeline connector */}
            <div className="relative flex flex-col items-center pt-2">
              {/* Vertical line above */}
              {index > 0 && (
                <div className="absolute -top-0.5 left-1/2 w-0.5 h-2 bg-border -translate-x-1/2" />
              )}
              
              {/* Node circle */}
              <button
                onClick={() => onSelectVersion(version.id)}
                className={cn(
                  "relative z-10 w-3 h-3 rounded-full border-2 transition-all",
                  isSelected
                    ? "bg-primary border-primary scale-125"
                    : isCurrent
                    ? "bg-primary/50 border-primary"
                    : "bg-background border-muted-foreground/50 hover:border-primary"
                )}
              >
                {isCurrent && !isSelected && (
                  <Circle className="absolute inset-0 h-3 w-3 text-primary animate-pulse" />
                )}
              </button>
              
              {/* Vertical line below */}
              {!isLast && (
                <div className="absolute top-5 left-1/2 w-0.5 h-full bg-border -translate-x-1/2" />
              )}
              
              {/* Branch indicator */}
              {hasBranch && (
                <GitBranch className="absolute top-5 -right-1 h-2.5 w-2.5 text-muted-foreground" />
              )}
            </div>

            {/* Version info */}
            <button
              onClick={() => onSelectVersion(version.id)}
              className={cn(
                "flex-1 text-left py-1.5 px-2 rounded-md transition-all",
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
                  <span className="text-[9px] px-1 py-0.5 rounded-full bg-green-500/20 text-green-600 font-medium">
                    Published
                  </span>
                )}
                {isCurrent && (
                  <span className="text-[9px] px-1 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
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

import * as React from "react";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "@/lib/utils";

const ResizablePanelGroup = ({ className, ...props }: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className)}
    {...props}
  />
);

const ResizablePanel = ResizablePrimitive.Panel;

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean;
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      "group relative flex w-px items-center justify-center bg-transparent data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full focus-visible:outline-none",
      className,
    )}
    {...props}
  >
    {/* Glass line background */}
    <div className="absolute inset-y-4 w-[1px] bg-border/40 backdrop-blur-sm transition-all duration-300 group-hover:bg-border/60 group-hover:w-[2px] data-[panel-group-direction=vertical]:inset-y-0 data-[panel-group-direction=vertical]:inset-x-4 data-[panel-group-direction=vertical]:h-[1px] data-[panel-group-direction=vertical]:w-auto group-hover:data-[panel-group-direction=vertical]:h-[2px]" />
    
    {/* Gradient accent on hover */}
    <div className="absolute inset-y-[20%] w-[2px] bg-gradient-to-b from-transparent via-primary/50 to-transparent opacity-0 blur-[1px] transition-all duration-300 group-hover:opacity-100 group-hover:w-[3px] data-[panel-group-direction=vertical]:inset-y-0 data-[panel-group-direction=vertical]:inset-x-[20%] data-[panel-group-direction=vertical]:h-[2px] data-[panel-group-direction=vertical]:w-auto data-[panel-group-direction=vertical]:bg-gradient-to-r group-hover:data-[panel-group-direction=vertical]:h-[3px]" />
    
    {withHandle && (
      <div className="z-10 flex h-12 w-4 items-center justify-center rounded-full bg-background/80 backdrop-blur-md border border-border/30 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md group-hover:border-primary/20">
        <div className="flex flex-col gap-[2px]">
          <div className="h-[2px] w-[2px] rounded-full bg-muted-foreground/60 group-hover:bg-primary/70 transition-colors" />
          <div className="h-[2px] w-[2px] rounded-full bg-muted-foreground/60 group-hover:bg-primary/70 transition-colors" />
          <div className="h-[2px] w-[2px] rounded-full bg-muted-foreground/60 group-hover:bg-primary/70 transition-colors" />
        </div>
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };

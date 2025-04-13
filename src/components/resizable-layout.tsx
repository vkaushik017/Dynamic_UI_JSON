"use client";

import React, { useCallback } from "react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useState } from "react";
import {
  Minus,
  LayoutGrid,
  Check,
  MoveHorizontal,
  MoveVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Enhanced types for our layout configuration
type ScrollConfig = {
  direction: "horizontal" | "vertical" | "both";
  enabled: boolean;
};

type PanelConfig = {
  id: string;
  defaultSize: number;
  minSize?: number;
  maxSize?: number;
  content?: string;
  contentContainerClass?: string;
  textClass?: string;
  isScrollable?: ScrollConfig;
  isAdminOnly?: boolean;
  // Nested layout is optional
  nested?: {
    direction: "horizontal" | "vertical";
    panels: PanelConfig[];
  };
};

type LayoutConfig = {
  direction: "horizontal" | "vertical";
  className?: string;
  panels: PanelConfig[];
};

type ResizableLayoutProps = {
  config?: LayoutConfig;
  initialConfig?: LayoutConfig;
  isAdmin?: boolean;
};

export function ResizableLayout({
  config: configProp,
  initialConfig,
  isAdmin = false,
}: ResizableLayoutProps) {
  // Use state so we can update the layout dynamically
  const [config, setConfig] = useState<LayoutConfig>(
    configProp ||
      initialConfig || {
        direction: "horizontal",
        className: "max-w-full rounded-lg border",
        panels: [
          {
            id: "panel-1",
            defaultSize: 50,
            minSize: 20,
            maxSize: 80,
            content: "Panel 1",
            contentContainerClass:
              "flex h-[200px] items-center justify-center p-6",
            textClass: "font-semibold",
          },
          {
            id: "panel-2",
            defaultSize: 50,
            minSize: 20,
            maxSize: 80,
            content: "Panel 2",
            contentContainerClass:
              "flex h-[200px] items-center justify-center p-6",
            textClass: "font-semibold",
          },
        ],
      }
  );

  // Track the selected panel
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);

  // Function to toggle panel selection
  const togglePanelSelection = (panelId: string) => {
    setSelectedPanelId((prev) => (prev === panelId ? null : panelId));
  };

  // Function to find a panel by ID (handles nested panels)
  const findPanelById = useCallback(
    (panelId: string, panels: PanelConfig[]): PanelConfig | null => {
      for (const panel of panels) {
        if (panel.id === panelId) {
          return panel;
        }
        if (panel.nested) {
          const nestedResult = findPanelById(panelId, panel.nested.panels);
          if (nestedResult) {
            return nestedResult;
          }
        }
      }
      return null;
    },
    []
  );

  // Function to find parent panel and its direction
  const findParentPanel = useCallback(
    (
      panelId: string,
      panels: PanelConfig[],
      parentDirection: "horizontal" | "vertical"
    ): {
      parent: PanelConfig[] | null;
      direction: "horizontal" | "vertical";
    } => {
      for (const panel of panels) {
        if (panel.id === panelId) {
          return { parent: panels, direction: parentDirection };
        }
        if (panel.nested) {
          const result = findParentPanel(
            panelId,
            panel.nested.panels,
            panel.nested.direction
          );
          if (result.parent) {
            return result;
          }
        }
      }
      return { parent: null, direction: parentDirection };
    },
    []
  );

  // Function to recursively render panels
  const renderPanelGroup = (
    panelConfig:
      | LayoutConfig
      | {
          direction: "horizontal" | "vertical";
          panels: PanelConfig[];
          className: string;
        },
    parentId?: string
  ) => {
    // Filter out admin-only panels if user is not admin
    const visiblePanels = panelConfig.panels.filter(
      (panel) => !panel.isAdminOnly || isAdmin
    );

    return (
      <ResizablePanelGroup
        direction={panelConfig.direction}
        className={panelConfig.className}
      >
        {visiblePanels.map((panel, index) => (
          <React.Fragment key={panel.id}>
            <ResizablePanel
              defaultSize={panel.defaultSize}
              minSize={panel.minSize || 10}
              maxSize={panel.maxSize || 90}
            >
              {panel.nested ? (
                // Render nested panel group
                renderPanelGroup(panel.nested, panel.id)
              ) : (
                // Render content panel
                <div
                  className={cn(
                    "relative group h-full w-full",
                    panel.contentContainerClass,
                    selectedPanelId === panel.id &&
                      "ring-2 ring-primary ring-inset",
                    panel.isScrollable?.enabled && {
                      "overflow-x-auto":
                        panel.isScrollable.direction === "horizontal" ||
                        panel.isScrollable.direction === "both",
                      "overflow-y-auto":
                        panel.isScrollable.direction === "vertical" ||
                        panel.isScrollable.direction === "both",
                    }
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePanelSelection(panel.id);
                  }}
                  style={{
                    minWidth:
                      panel.isScrollable?.direction === "horizontal" ||
                      panel.isScrollable?.direction === "both"
                        ? "300px" // Force minimum width for horizontal scrolling
                        : undefined,
                  }}
                >
                  {/* Add some long content for horizontal scroll testing */}
                  <div
                    className={cn(
                      panel.isScrollable?.direction === "horizontal" ||
                        panel.isScrollable?.direction === "both"
                        ? "min-w-[500px]" // Force content to be wider than container
                        : ""
                    )}
                  >
                    <span className={panel.textClass}>{panel.content}</span>
                  </div>

                  {/* Panel controls */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {selectedPanelId === panel.id && (
                      <button
                        className="bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-full p-1"
                        title="Selected"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePanel(panel.id);
                      }}
                      title="Remove panel"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </ResizablePanel>
            {index < visiblePanels.length - 1 && <ResizableHandle />}
          </React.Fragment>
        ))}
      </ResizablePanelGroup>
    );
  };

  // Function to find and remove a panel by ID (handles nested panels)
  const removePanel = (panelId: string) => {
    if (selectedPanelId === panelId) {
      setSelectedPanelId(null);
    }

    const removeFromPanels = (panels: PanelConfig[]): PanelConfig[] => {
      // Filter out the panel with the matching ID
      const filteredPanels = panels.filter((p) => p.id !== panelId);

      // Process any nested panels
      return filteredPanels.map((panel) => {
        if (panel.nested) {
          return {
            ...panel,
            nested: {
              ...panel.nested,
              panels: removeFromPanels(panel.nested.panels),
            },
          };
        }
        return panel;
      });
    };

    setConfig((prev) => ({
      ...prev,
      panels: removeFromPanels(prev.panels),
    }));
  };

  // Function to update panels (used for adding panels to selected panel)
  const updatePanels = (
    panels: PanelConfig[],
    targetId: string | null,
    newPanel: PanelConfig,
    direction: "horizontal" | "vertical"
  ): PanelConfig[] => {
    // If no target is selected, add to the root level
    if (!targetId) {
      // If we're adding in the same direction as the current layout
      if (direction === config.direction) {
        // Adjust sizes of existing panels to make room for the new one
        const adjustedPanels = panels.map((panel) => ({
          ...panel,
          defaultSize:
            panel.defaultSize * (panels.length / (panels.length + 1)),
        }));
        return [...adjustedPanels, newPanel];
      } else {
        // We're adding in the opposite direction, so we need to create a new nested structure
        // First, create a container for all existing panels
        const existingPanelsContainer: PanelConfig = {
          id: `container-${Date.now()}`,
          defaultSize: 50,
          nested: {
            direction: config.direction,
            panels: panels,
          },
        };

        // Set the new panel's default size to match
        newPanel.defaultSize = 50;

        // Return a new array with the container and the new panel
        return [existingPanelsContainer, newPanel];
      }
    }

    return panels.map((panel) => {
      // If this is the target panel and it has nested panels
      if (panel.id === targetId && panel.nested) {
        // If we're adding in the same direction as the nested layout
        if (direction === panel.nested.direction) {
          const nestedPanels = panel.nested.panels;
          const adjustedNestedPanels = nestedPanels.map((nestedPanel) => ({
            ...nestedPanel,
            defaultSize:
              nestedPanel.defaultSize *
              (nestedPanels.length / (nestedPanels.length + 1)),
          }));

          return {
            ...panel,
            nested: {
              ...panel.nested,
              panels: [...adjustedNestedPanels, newPanel],
            },
          };
        } else {
          // We're adding in the opposite direction, need to restructure
          // Create a new container for the existing nested panels
          const existingNestedContainer: PanelConfig = {
            id: `container-${Date.now()}`,
            defaultSize: 50,
            nested: {
              direction: panel.nested.direction,
              panels: panel.nested.panels,
            },
          };

          // Set the new panel's default size to match
          newPanel.defaultSize = 50;

          return {
            ...panel,
            nested: {
              direction: direction,
              panels: [existingNestedContainer, newPanel],
            },
          };
        }
      }
      // If this is the target panel but it doesn't have nested panels yet
      else if (panel.id === targetId) {
        return {
          ...panel,
          nested: {
            direction: direction,
            panels: [
              {
                id: `${panel.id}-content`,
                defaultSize: 50,
                content: panel.content,
                contentContainerClass: panel.contentContainerClass,
                textClass: panel.textClass,
                isScrollable: panel.isScrollable,
                minSize: panel.minSize,
                maxSize: panel.maxSize,
              },
              {
                ...newPanel,
                defaultSize: 50,
              },
            ],
          },
          // Remove content from parent since it's now in a nested panel
          content: undefined,
          contentContainerClass: undefined,
          textClass: undefined,
          isScrollable: undefined,
        };
      }
      // If this panel has nested panels, recursively check them
      else if (panel.nested) {
        return {
          ...panel,
          nested: {
            ...panel.nested,
            panels: updatePanels(
              panel.nested.panels,
              targetId,
              newPanel,
              direction
            ),
          },
        };
      }
      // Otherwise, return the panel unchanged
      return panel;
    });
  };

  // Add a new panel
  const addPanel = (direction: "horizontal" | "vertical") => {
    const newId = `panel-${Date.now()}`;
    const newPanel: PanelConfig = {
      id: newId,
      defaultSize: 50,
      minSize: 20,
      maxSize: 80,
      content: `Panel ${newId.split("-")[1]}`,
      contentContainerClass: "flex h-[200px] items-center justify-center p-6",
      textClass: "font-semibold",
    };

    setConfig((prev) => {
      // If we're adding to a selected panel, find its parent's direction
      if (selectedPanelId) {
        const { parent, direction: parentDirection } = findParentPanel(
          selectedPanelId,
          prev.panels,
          prev.direction
        );
        if (parent) {
          return {
            ...prev,
            panels: updatePanels(
              prev.panels,
              selectedPanelId,
              newPanel,
              direction
            ),
          };
        }
      }

      // If no selection or parent not found, add to root
      return {
        ...prev,
        panels: updatePanels(prev.panels, selectedPanelId, newPanel, direction),
      };
    });
  };

  // Add a nested panel
  const addNestedPanel = (direction: "horizontal" | "vertical") => {
    const newId = `panel-${Date.now()}`;
    const newNestedPanel: PanelConfig = {
      id: newId,
      defaultSize: 50,
      minSize: 20,
      maxSize: 80,
      nested: {
        direction: direction === "horizontal" ? "vertical" : "horizontal", // Perpendicular direction for nested panels
        panels: [
          {
            id: `${newId}-1`,
            defaultSize: 50,
            minSize: 20,
            maxSize: 80,
            content: "Nested 1",
            contentContainerClass:
              "flex h-full items-center justify-center p-6",
            textClass: "font-semibold",
          },
          {
            id: `${newId}-2`,
            defaultSize: 50,
            minSize: 20,
            maxSize: 80,
            content: "Nested 2",
            contentContainerClass:
              "flex h-full items-center justify-center p-6",
            textClass: "font-semibold",
          },
        ],
      },
    };

    setConfig((prev) => ({
      ...prev,
      panels: updatePanels(
        prev.panels,
        selectedPanelId,
        newNestedPanel,
        direction
      ),
    }));
  };

  // Toggle layout direction for the entire layout or a selected panel
  const toggleDirection = () => {
    if (selectedPanelId) {
      // Toggle direction of the selected panel if it has nested panels
      setConfig((prev) => {
        const updateNestedDirection = (
          panels: PanelConfig[]
        ): PanelConfig[] => {
          return panels.map((panel) => {
            if (panel.id === selectedPanelId && panel.nested) {
              return {
                ...panel,
                nested: {
                  ...panel.nested,
                  direction:
                    panel.nested.direction === "horizontal"
                      ? "vertical"
                      : "horizontal",
                },
              };
            }
            if (panel.nested) {
              return {
                ...panel,
                nested: {
                  ...panel.nested,
                  panels: updateNestedDirection(panel.nested.panels),
                },
              };
            }
            return panel;
          });
        };

        return {
          ...prev,
          panels: updateNestedDirection(prev.panels),
        };
      });
    } else {
      // Toggle direction of the root layout
      setConfig((prev) => ({
        ...prev,
        direction: prev.direction === "horizontal" ? "vertical" : "horizontal",
      }));
    }
  };

  // Make selected panel scrollable
  const makeSelectedPanelScrollable = (
    direction: "horizontal" | "vertical" | "both"
  ) => {
    if (!selectedPanelId) return;

    const updateScrollable = (panels: PanelConfig[]): PanelConfig[] => {
      return panels.map((panel) => {
        if (panel.id === selectedPanelId) {
          return {
            ...panel,
            isScrollable: {
              enabled: true,
              direction,
            },
          };
        }
        if (panel.nested) {
          return {
            ...panel,
            nested: {
              ...panel.nested,
              panels: updateScrollable(panel.nested.panels),
            },
          };
        }
        return panel;
      });
    };

    setConfig((prev) => ({
      ...prev,
      panels: updateScrollable(prev.panels),
    }));
  };

  // Toggle admin-only for selected panel
  const toggleAdminOnly = () => {
    if (!selectedPanelId) return;

    const updateAdminOnly = (panels: PanelConfig[]): PanelConfig[] => {
      return panels.map((panel) => {
        if (panel.id === selectedPanelId) {
          return {
            ...panel,
            isAdminOnly: !panel.isAdminOnly,
          };
        }
        if (panel.nested) {
          return {
            ...panel,
            nested: {
              ...panel.nested,
              panels: updateAdminOnly(panel.nested.panels),
            },
          };
        }
        return panel;
      });
    };

    setConfig((prev) => ({
      ...prev,
      panels: updateAdminOnly(prev.panels),
    }));
  };

  // Get selected panel details
  const selectedPanel = selectedPanelId
    ? findPanelById(selectedPanelId, config.panels)
    : null;

  return (
    <div className="space-y-4" onClick={() => setSelectedPanelId(null)}>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium">Add Panel</Label>
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      addPanel("horizontal");
                    }}
                    className="flex items-center gap-1"
                    variant="outline"
                    size="sm"
                  >
                    <MoveHorizontal className="h-4 w-4" /> Horizontal
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {selectedPanelId
                    ? "Add horizontal panel to selected panel"
                    : "Add horizontal panel to root"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      addPanel("vertical");
                    }}
                    className="flex items-center gap-1"
                    variant="outline"
                    size="sm"
                  >
                    <MoveVertical className="h-4 w-4" /> Vertical
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {selectedPanelId
                    ? "Add vertical panel to selected panel"
                    : "Add vertical panel to root"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium">Add Nested Panel</Label>
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      addNestedPanel("horizontal");
                    }}
                    className="flex items-center gap-1"
                    variant="outline"
                    size="sm"
                  >
                    <MoveHorizontal className="h-4 w-4" /> Horizontal
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {selectedPanelId
                    ? "Add horizontal nested panel to selected panel"
                    : "Add horizontal nested panel to root"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      addNestedPanel("vertical");
                    }}
                    className="flex items-center gap-1"
                    variant="outline"
                    size="sm"
                  >
                    <MoveVertical className="h-4 w-4" /> Vertical
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {selectedPanelId
                    ? "Add vertical nested panel to selected panel"
                    : "Add vertical nested panel to root"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium">Toggle Direction</Label>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              toggleDirection();
            }}
            className="flex items-center gap-1"
            variant="outline"
            size="sm"
          >
            <LayoutGrid className="h-4 w-4" />
            {selectedPanelId ? "Toggle Selected" : "Toggle Root"}
          </Button>
        </div>
      </div>

      {/* Selected panel controls */}
      {selectedPanel && (
        <div
          className="p-4 border rounded-lg bg-muted/30"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="font-medium mb-2">
            Selected Panel: {selectedPanel.content || selectedPanel.id}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="admin-only">Admin Only</Label>
              <Switch
                id="admin-only"
                checked={selectedPanel.isAdminOnly || false}
                onCheckedChange={() => toggleAdminOnly()}
              />
            </div>

            <div className="space-y-2">
              <Label>Make Scrollable</Label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => makeSelectedPanelScrollable("horizontal")}
                >
                  Horizontal
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => makeSelectedPanelScrollable("vertical")}
                >
                  Vertical
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => makeSelectedPanelScrollable("both")}
                >
                  Both
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className="border rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {renderPanelGroup(config)}
      </div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { Code, FileJson } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { ResizableLayout } from "./resizable-layout";

// JSON Editor component with improved styling
const JsonEditor = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    try {
      JSON.parse(newValue);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="relative h-full">
      <textarea
        className={cn(
          "w-full h-full p-4 font-mono text-sm resize-none bg-background border-0 focus:outline-none",
          error && "border-red-500"
        )}
        value={value}
        onChange={handleChange}
        spellCheck={false}
      />
      {error && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-500/10 text-red-500 p-2 text-xs">
          {error}
        </div>
      )}
    </div>
  );
};

// Code Editor component with improved styling
const CodeEditor = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  return (
    <div className="h-full">
      <textarea
        className="w-full h-full p-4 font-mono text-sm resize-none bg-background border-0 focus:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
      />
    </div>
  );
};

// Default configuration for a realistic UI preview
const defaultConfig = {
  direction: "vertical",
  className: "max-w-full rounded-lg h-full",
  panels: [
    {
      id: "header-panel",
      defaultSize: 15,
      minSize: 10,
      maxSize: 20,
      contentContainerClass:
        "flex items-center justify-between p-4 bg-muted/20",
      content: (
        <div className="flex justify-between items-center w-full">
          <h2 className="text-xl font-bold">Dashboard</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Settings
            </Button>
            <Button size="sm">New Item</Button>
          </div>
        </div>
      ),
    },
    {
      id: "content-panel",
      defaultSize: 85,
      minSize: 50,
      maxSize: 90,
      nested: {
        direction: "horizontal",
        className: "h-full",
        panels: [
          {
            id: "main-content",
            defaultSize: 70,
            minSize: 50,
            maxSize: 80,
            contentContainerClass: "p-4 h-full overflow-auto",
            content: (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Recent Activity</h3>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </div>
                <div className="grid gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Item {i}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          This is a sample item in the dashboard. You can
                          customize this through the editor.
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ),
          },
          {
            id: "sidebar",
            defaultSize: 30,
            minSize: 20,
            maxSize: 40,
            contentContainerClass: "p-4 border-l h-full bg-muted/10",
            content: (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Quick Actions</h3>
                <div className="space-y-2">
                  <Input placeholder="Search..." />
                  <div className="space-y-2 pt-2">
                    <Button
                      variant="secondary"
                      className="w-full justify-start"
                    >
                      Dashboard
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      Analytics
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      Settings
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      Profile
                    </Button>
                  </div>
                </div>
              </div>
            ),
          },
        ],
      },
    },
  ],
};

// Sample code template
const codeTemplate = `// Edit this code to customize your layout
const myConfig = {
  direction: "vertical",
  className: "max-w-full rounded-lg h-full",
  panels: [
    {
      id: "header-panel",
      defaultSize: 15,
      minSize: 10,
      maxSize: 20,
      contentContainerClass: "flex items-center justify-between p-4 bg-muted/20",
      content: "Header Content"
    },
    {
      id: "content-panel",
      defaultSize: 85,
      minSize: 50,
      maxSize: 90,
      nested: {
        direction: "horizontal",
        className: "h-full",
        panels: [
          {
            id: "main-content",
            defaultSize: 70,
            minSize: 50,
            maxSize: 80,
            contentContainerClass: "p-4 h-full",
            content: "Main Content Area"
          },
          {
            id: "sidebar",
            defaultSize: 30,
            minSize: 20,
            maxSize: 40,
            contentContainerClass: "p-4 border-l h-full bg-muted/10",
            content: "Sidebar Content"
          }
        ]
      }
    }
  ]
};

// Return your config to update the layout
return myConfig;`;

export function ResizableLayoutEditor({ isAdmin = false }) {
  // State for the current configuration
  const [config, setConfig] = useState(defaultConfig);

  // State for the JSON representation
  const [jsonValue, setJsonValue] = useState(JSON.stringify(config, null, 2));

  // State for the code representation
  const [codeValue, setCodeValue] = useState(codeTemplate);

  // State for the current editor mode
  const [editorMode, setEditorMode] = useState<"json" | "code">("json");

  // Debounce the JSON changes to avoid too many updates
  const debouncedJsonValue = useDebounce(jsonValue, 500);
  const debouncedCodeValue = useDebounce(codeValue, 500);

  // Update the config when JSON changes
  useEffect(() => {
    try {
      const newConfig = JSON.parse(debouncedJsonValue);
      setConfig(newConfig);
    } catch (error) {
      // Invalid JSON, don't update the config
    }
  }, [debouncedJsonValue]);

  // Update the config when code changes
  useEffect(() => {
    try {
      // Create a function from the code string and execute it
      const evalFunction = new Function(debouncedCodeValue);
      const result = evalFunction();

      if (result && typeof result === "object") {
        setConfig(result);
        // Update JSON to match the new config
        setJsonValue(JSON.stringify(result, null, 2));
      }
    } catch (error) {
      // Invalid code, don't update the config
    }
  }, [debouncedCodeValue]);

  // Create layout configuration based on admin mode
  const layoutConfig = useMemo(() => {
    if (isAdmin) {
      // Admin mode: show both preview and editor panels
      return {
        direction: "horizontal" as const,
        className: "max-w-full rounded-lg border border-border h-[700px]",
        panels: [
          {
            id: "preview-panel",
            defaultSize: 67, // 2/3 of space
            minSize: 50,
            maxSize: 80,
            contentContainerClass: "h-full",
            nested: config,
          },
          {
            id: "editor-panel",
            defaultSize: 33, // 1/3 of space
            minSize: 20,
            maxSize: 50,
            contentContainerClass: "h-full p-0 bg-muted",
            content: (
              <div className="h-full flex flex-col">
                <div className="p-2 border-b">
                  <Tabs
                    value={editorMode}
                    onValueChange={(v) => setEditorMode(v as "json" | "code")}
                  >
                    <TabsList>
                      <TabsTrigger
                        value="json"
                        className="flex items-center gap-1"
                      >
                        <FileJson className="h-4 w-4" /> JSON
                      </TabsTrigger>
                      <TabsTrigger
                        value="code"
                        className="flex items-center gap-1"
                      >
                        <Code className="h-4 w-4" /> Code
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div className="flex-1 overflow-hidden">
                  {editorMode === "json" ? (
                    <JsonEditor value={jsonValue} onChange={setJsonValue} />
                  ) : (
                    <CodeEditor value={codeValue} onChange={setCodeValue} />
                  )}
                </div>
              </div>
            ),
          },
        ],
      };
    } else {
      // Non-admin mode: show only preview panel
      return config;
    }
  }, [isAdmin, config, jsonValue, codeValue, editorMode]);

  return (
    <div className="flex flex-col h-[80vh] space-y-4">
      {isAdmin && (
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Layout Editor</h2>
        </div>
      )}

      <div className="flex-1">
        <ResizableLayout config={layoutConfig} isAdmin={isAdmin} />
      </div>
    </div>
  );
}

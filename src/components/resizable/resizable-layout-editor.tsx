"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks/use-debounce";
import { Code, FileJson } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CodeEditor } from "./code-editor";
import { codeTemplate } from "./codeTemplate";
import { JsonEditor } from "./json-editor";
import { ResizableLayout } from "./resizable-layout";

export function ResizableLayoutEditor({
  initialConfig,
  isAdmin = false,
}: {
  initialConfig: any;
  isAdmin: boolean;
}) {
  const [config, setConfig] = useState(initialConfig);
  const [jsonValue, setJsonValue] = useState(JSON.stringify(config, null, 2));
  const [codeValue, setCodeValue] = useState(codeTemplate);
  const [editorMode, setEditorMode] = useState<"json" | "code">("json");
  const debouncedJsonValue = useDebounce(jsonValue, 500);
  const debouncedCodeValue = useDebounce(codeValue, 500);

  useEffect(() => {
    try {
      const newConfig = JSON.parse(debouncedJsonValue);
      setConfig(newConfig);
    } catch (error) {
      // Invalid JSON, don't update the config
    }
  }, [debouncedJsonValue]);

  useEffect(() => {
    try {
      const evalFunction = new Function(debouncedCodeValue);
      const result = evalFunction();

      if (result && typeof result === "object") {
        setConfig(result);
        setJsonValue(JSON.stringify(result, null, 2));
      }
    } catch (error) {
      // Invalid code, don't update the config
    }
  }, [debouncedCodeValue]);

  const layoutConfig = useMemo(() => {
    if (isAdmin) {
      return {
        direction: "horizontal" as const,
        className: "max-w-full rounded-lg border border-border h-[700px]",
        panels: [
          {
            id: "preview-panel",
            defaultSize: 67,
            minSize: 50,
            maxSize: 80,
            contentContainerClass: "h-full",
            nested: config,
          },
          {
            id: "editor-panel",
            defaultSize: 33,
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

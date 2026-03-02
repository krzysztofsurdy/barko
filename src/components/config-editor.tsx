"use client";

import { useState, useCallback } from "react";
import { SaveIcon } from "./icons";

interface ConfigEditorProps {
  file: string;
  initialContent: string;
  onSaved: () => void;
  onCancel: () => void;
}

export function ConfigEditor({
  file,
  initialContent,
  onSaved,
  onCancel,
}: ConfigEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasChanges = content !== initialContent;

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/config/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file, content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Save failed");
      } else {
        onSaved();
      }
    } catch (err) {
      setError(String(err));
    }
    setSaving(false);
    setConfirmOpen(false);
  }, [file, content, onSaved]);

  return (
    <div className="rounded-lg border border-card-border bg-card-bg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Editing: {file}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs rounded-md border border-card-border text-foreground/50 hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={!hasChanges || saving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-sidebar-active text-white hover:bg-sidebar-active/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <SaveIcon size={12} />
            Save
          </button>
        </div>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-[500px] font-mono text-xs bg-background rounded-md p-3 border border-card-border focus:outline-none focus:border-sidebar-active resize-y"
        spellCheck={false}
      />

      {error && (
        <div className="mt-2 text-xs text-accent-pink">{error}</div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card-bg border border-card-border rounded-lg p-6 max-w-md w-full mx-4">
            <h4 className="font-semibold mb-2">Confirm Save</h4>
            <p className="text-sm text-foreground/60 mb-4">
              This will overwrite the file. A backup will be created automatically.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-3 py-1.5 text-xs rounded-md border border-card-border text-foreground/50 hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1.5 text-xs rounded-md bg-sidebar-active text-white hover:bg-sidebar-active/80 transition-colors disabled:opacity-40"
              >
                {saving ? "Saving..." : "Confirm Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

export default function BulletListEditor({
  items,
  onChange,
}: {
  items: string[];
  onChange: (items: string[]) => void;
}) {
  function updateItem(idx: number, value: string) {
    onChange(items.map((item, i) => (i === idx ? value : item)));
  }

  function removeItem(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }

  function addItem() {
    onChange([...items, ""]);
  }

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="text-text-muted">•</span>
          <input
            value={item}
            onChange={(e) => updateItem(idx, e.target.value)}
            placeholder="e.g. Monthly performance report"
            className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={() => removeItem(idx)}
            aria-label="Remove line"
            className="flex-shrink-0 text-text-muted hover:text-danger"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="text-[13px] font-medium text-primary-text hover:underline"
      >
        + Add line
      </button>
    </div>
  );
}

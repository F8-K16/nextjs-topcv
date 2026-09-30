"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

import type { CategoryTreeNode } from "@/lib/category-hierarchy";

function parseIdList(value: string | null): number[] {
  if (!value) return [];
  return value
    .split(",")
    .map((x) => Number(x))
    .filter((n) => Number.isFinite(n) && n !== 0)
    .map((n) => Math.trunc(n));
}

function collectLeafIds(node: CategoryTreeNode): number[] {
  if (!node.children.length) {
    // Danh mục cha (id âm) không gắn job — chỉ id con dương mới lọc được.
    return node.id > 0 ? [node.id] : [];
  }
  const out: number[] = [];
  for (const child of node.children) out.push(...collectLeafIds(child));
  return out;
}

function buildNodeIndex(tree: CategoryTreeNode[]): Map<number, CategoryTreeNode> {
  const out = new Map<number, CategoryTreeNode>();
  const stack = [...tree];
  while (stack.length) {
    const cur = stack.pop()!;
    out.set(cur.id, cur);
    for (const child of cur.children) stack.push(child);
  }
  return out;
}

function ParentCheckbox({
  checked,
  indeterminate,
  onChange,
  label,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  const ref = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      aria-label={label}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e.target.checked)}
      className="h-4 w-4 shrink-0 cursor-pointer rounded border-zinc-300 text-primary focus:ring-primary"
    />
  );
}

export default function CategoryFilterAccordion({
  tree,
}: {
  tree: CategoryTreeNode[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const roots = useMemo(() => tree.filter((x) => x.parentId == null), [tree]);
  const nodeById = useMemo(() => buildNodeIndex(roots), [roots]);

  const urlSelectedIds = useMemo(() => {
    const explicit = parseIdList(searchParams.get("categoryIds"));
    const raw = explicit.length
      ? explicit
      : (() => {
          const legacyId = Number(searchParams.get("categoryId"));
          if (!Number.isFinite(legacyId) || legacyId === 0) return [];
          return [Math.trunc(legacyId)];
        })();

    const out: number[] = [];
    for (const id of raw) {
      const node =
        nodeById.get(id) ?? (id > 0 ? nodeById.get(-id) : undefined);
      if (node) out.push(...collectLeafIds(node));
      else if (id > 0) out.push(id);
    }
    return [...new Set(out)].sort((a, b) => a - b);
  }, [nodeById, searchParams]);

  const urlKey = urlSelectedIds.join(",");
  const [overrideIds, setOverrideIds] = useState<number[] | null>(null);
  useEffect(() => {
    setOverrideIds(null);
  }, [urlKey]);

  const selectedIds = overrideIds ?? urlSelectedIds;
  const selectedSet = useMemo(() => new Set<number>(selectedIds), [selectedIds]);

  const autoOpenSet = useMemo(() => {
    const next = new Set<number>();
    for (const parent of roots) {
      const leafIds = collectLeafIds(parent);
      const hasAny = leafIds.some((id) => selectedSet.has(id));
      if (hasAny) next.add(parent.id);
    }
    return next;
  }, [roots, selectedSet]);

  const [openOverride, setOpenOverride] = useState<Record<number, boolean>>({});

  const updateUrl = (nextSelected: Set<number>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("categoryId");
    const sorted = [...nextSelected].sort((a, b) => a - b);
    setOverrideIds(sorted);
    if (!sorted.length) params.delete("categoryIds");
    else params.set("categoryIds", sorted.join(","));
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `/jobs?${qs}` : "/jobs", { scroll: false });
  };

  const setNodeChecked = (node: CategoryTreeNode, checked: boolean) => {
    const leafIds = collectLeafIds(node);
    if (!leafIds.length) return;
    const next = new Set<number>(selectedSet);
    if (checked) {
      for (const id of leafIds) next.add(id);
    } else {
      for (const id of leafIds) next.delete(id);
    }
    updateUrl(next);
  };

  return (
    <div className="space-y-2">
      {roots.map((parent) => {
        const leafIds = collectLeafIds(parent);
        const hasAny = leafIds.some((id) => selectedSet.has(id));
        const allChecked = leafIds.length
          ? leafIds.every((id) => selectedSet.has(id))
          : false;
        const indeterminate = hasAny && !allChecked;
        const isOpen = openOverride[parent.id] ?? autoOpenSet.has(parent.id);
        return (
          <div key={parent.id} className="rounded-xl border border-zinc-200/80">
            <div className="flex items-center gap-1 pr-1">
              <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 px-3 py-2.5">
                <ParentCheckbox
                  checked={allChecked}
                  indeterminate={indeterminate}
                  label={`Lọc ngành ${parent.name}`}
                  onChange={(checked) => setNodeChecked(parent, checked)}
                />
                <span className="truncate text-sm font-semibold text-zinc-900">
                  {parent.name}
                </span>
              </label>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-label={
                  isOpen
                    ? `Thu gọn ${parent.name}`
                    : `Mở danh mục con ${parent.name}`
                }
                onClick={() =>
                  setOpenOverride((prev) => {
                    const current = prev[parent.id] ?? autoOpenSet.has(parent.id);
                    return { ...prev, [parent.id]: !current };
                  })
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
              >
                <ChevronDown
                  className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            {isOpen ? (
              <div className="border-t border-zinc-100 px-3 py-2.5">
                {parent.children.length ? (
                  <ul className="space-y-2">
                    {parent.children.map((child) => {
                      const childLeafIds = collectLeafIds(child);
                      const childHasAny = childLeafIds.some((id) =>
                        selectedSet.has(id),
                      );
                      const childAllChecked = childLeafIds.length
                        ? childLeafIds.every((id) => selectedSet.has(id))
                        : false;
                      const childIndeterminate = childHasAny && !childAllChecked;
                      return (
                        <li key={child.id}>
                          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
                            <ParentCheckbox
                              checked={childAllChecked}
                              indeterminate={childIndeterminate}
                              label={`Lọc ${child.name}`}
                              onChange={(checked) => setNodeChecked(child, checked)}
                            />
                            <span className="min-w-0 truncate">
                              {child.name}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-zinc-500">Chưa có danh mục con</p>
                )}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

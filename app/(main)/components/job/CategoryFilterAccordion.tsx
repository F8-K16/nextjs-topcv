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
    .filter((n) => Number.isFinite(n) && n > 0)
    .map((n) => Math.trunc(n));
}

function collectLeafIds(node: CategoryTreeNode): number[] {
  if (!node.children.length) return [node.id];
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
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: (checked: boolean) => void;
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
      onChange={(e) => onChange(e.target.checked)}
      className="rounded border-zinc-300 text-primary focus:ring-primary"
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

  const selectedIds = useMemo(() => {
    const explicit = parseIdList(searchParams.get("categoryIds"));
    if (explicit.length) return [...new Set(explicit)].sort((a, b) => a - b);
    const legacyId = Number(searchParams.get("categoryId"));
    if (!Number.isFinite(legacyId) || legacyId <= 0) return [];
    const legacyKey = Math.trunc(legacyId);
    const node = nodeById.get(legacyKey) ?? nodeById.get(-legacyKey);
    if (!node) return [Math.trunc(legacyId)];
    return [...new Set(collectLeafIds(node))].sort((a, b) => a - b);
  }, [nodeById, searchParams]);

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
    if (!sorted.length) params.delete("categoryIds");
    else params.set("categoryIds", sorted.join(","));
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `/jobs?${qs}` : "/jobs");
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

  const toggleParent = (parent: CategoryTreeNode) => {
    const leafIds = collectLeafIds(parent);
    if (!leafIds.length) return;
    const allChecked = leafIds.every((id) => selectedSet.has(id));
    const next = new Set<number>(selectedSet);
    if (allChecked) {
      for (const id of leafIds) next.delete(id);
    } else {
      for (const id of leafIds) next.add(id);
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
            <button
              type="button"
              onClick={() =>
                setOpenOverride((prev) => {
                  const current = prev[parent.id] ?? autoOpenSet.has(parent.id);
                  return { ...prev, [parent.id]: !current };
                })
              }
              className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center"
                >
                  <ParentCheckbox
                    checked={allChecked}
                    indeterminate={indeterminate}
                    onChange={() => toggleParent(parent)}
                  />
                </span>
                <span className="truncate text-sm font-semibold text-zinc-900">
                  {parent.name}
                </span>
              </div>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-zinc-400 transition ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

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

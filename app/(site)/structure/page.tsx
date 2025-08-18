"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  GitBranch,
  Building2,
  Landmark,
  ChevronDown,
  ChevronRight,
  Search,
  Users,
  MapPin,
  Phone,
  Mail,
  Download,
  Link as LinkIcon,
  AlertCircle,
} from "lucide-react";
import ErrorComponent from "@/components/error-component";

// ===== Types =====
export type UnitType =
  | "authority"
  | "directorate"
  | "department"
  | "division"
  | "unit"
  | "center"
  | "office";

export interface Employee {
  position?: string;
  name: string;
  phone?: string;
  email?: string;
}

export interface StructureNode {
  id: number | string;
  parent_id?: number | string | null;
  name: string;
  type: UnitType;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  employees?: Employee[] | string | null;
  children?: StructureNode[];
}

// ===== Helpers (kept simple) =====
const TYPE_LABEL: Record<UnitType, string> = {
  authority: "الهيئة",
  directorate: "إدارة عامة",
  department: "قسم",
  division: "شعبة",
  unit: "وحدة",
  center: "مركز",
  office: "مكتب",
};

const TYPE_ICON: Record<UnitType, any> = {
  authority: Landmark,
  directorate: Landmark,
  department: Building2,
  division: Building2,
  unit: Building2,
  center: GitBranch,
  office: Building2,
};

function normalizeEmployees(e?: StructureNode["employees"]): Employee[] {
  if (!e) return [];
  if (Array.isArray(e)) return e as Employee[];
  try {
    const parsed = JSON.parse(e as string);
    return Array.isArray(parsed) ? (parsed as Employee[]) : [];
  } catch {
    return [];
  }
}

function buildTree(items: StructureNode[]): StructureNode[] {
  const nodes = items.map((n) => ({
    ...n,
    employees: normalizeEmployees(n.employees),
    children: Array.isArray(n.children)
      ? n.children.map((c: any) => ({
          ...c,
          employees: normalizeEmployees(c.employees),
        }))
      : [],
  }));

  // If already a single-root tree
  if (nodes.length === 1 && nodes[0].children?.length) return nodes;

  const map = new Map<StructureNode["id"], StructureNode>();
  nodes.forEach((n) => map.set(n.id, n));

  const roots: StructureNode[] = [];
  nodes.forEach((n) => {
    if (n.parent_id == null) roots.push(n);
    else {
      const p = map.get(n.parent_id);
      p ? (p.children ||= []).push(n) : roots.push(n);
    }
  });

  const order: UnitType[] = [
    "authority",
    "directorate",
    "department",
    "division",
    "unit",
    "center",
    "office",
  ];
  const sort = (a: StructureNode, b: StructureNode) => {
    const t = order.indexOf(a.type) - order.indexOf(b.type);
    return t !== 0
      ? t
      : a.name.localeCompare(b.name, undefined, { numeric: true });
  };
  const rec = (arr: StructureNode[]) => {
    arr.sort(sort);
    arr.forEach((c) => c.children && rec(c.children));
  };
  rec(roots);
  return roots;
}

function getPathToNode(nodes: StructureNode[], targetId: StructureNode["id"]) {
  const path: StructureNode[] = [];
  function dfs(list: StructureNode[]): boolean {
    for (const n of list) {
      path.push(n);
      if (n.id == targetId) return true;
      if (n.children && dfs(n.children)) return true;
      path.pop();
    }
    return false;
  }
  dfs(nodes);
  return path;
}

function collectIds(
  nodes: StructureNode[],
  out = new Set<StructureNode["id"]>()
) {
  nodes.forEach((n) => {
    out.add(n.id);
    if (n.children?.length) collectIds(n.children, out);
  });
  return out;
}

function downloadJSON(filename: string, data: any) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function highlight(text: string, q: string) {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded bg-yellow-200 px-1 py-0.5 text-black">
        {text.slice(i, i + q.length)}
      </mark>
      {text.slice(i + q.length)}
    </>
  );
}

// ===== Tree node =====
interface TreeNodeProps {
  node: StructureNode;
  expanded: Set<string | number>;
  onToggle: (id: string | number) => void;
  onSelect: (node: StructureNode) => void;
  selectedId?: string | number | null;
  query: string;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  expanded,
  onToggle,
  onSelect,
  selectedId,
  query,
}) => {
  const hasChildren = !!node.children?.length;
  const isOpen = expanded.has(node.id);
  const Icon = TYPE_ICON[node.type];

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted ${
          selectedId == node.id ? "bg-muted" : ""
        }`}
      >
        <button
          onClick={() => (hasChildren ? onToggle(node.id) : onSelect(node))}
          className="flex items-center gap-1"
          aria-label={hasChildren ? (isOpen ? "Collapse" : "Expand") : "Select"}
        >
          {hasChildren ? (
            isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : (
            <span className="w-4" />
          )}
        </button>
        <button
          className="flex min-w-0 flex-1 items-center gap-2 text-right"
          onClick={() => onSelect(node)}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="truncate" title={node.name}>
            {highlight(node.name, query)}
          </span>
          <Badge variant="secondary" className="ml-auto shrink-0">
            {TYPE_LABEL[node.type]}
          </Badge>
        </button>
      </div>
      {hasChildren && isOpen && (
        <div className="pl-4">
          {node.children!.map((c) => (
            <TreeNode
              key={c.id}
              node={c}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
              selectedId={selectedId}
              query={query}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ===== Page (simplified but cool) =====
const StructurePage: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["structures"],
    queryFn: async () => {
      const res = await api.get("/structures");
      return res.data as
        | StructureNode[]
        | StructureNode
        | { data: StructureNode[] };
    },
  });

  // Normalize to roots
  const roots = React.useMemo<StructureNode[]>(() => {
    if (!data) return [];
    const raw = Array.isArray(data)
      ? data
      : (data as any).data
      ? ((data as any).data as StructureNode[])
      : (data as any);
    if (Array.isArray(raw)) return buildTree(raw);
    return (raw as StructureNode).children
      ? [raw as StructureNode]
      : buildTree([raw as StructureNode]);
  }, [data]);

  // UI state
  const [query, setQuery] = React.useState("");
  const [expanded, setExpanded] = React.useState<Set<string | number>>(
    new Set()
  );
  const [selected, setSelected] = React.useState<StructureNode | null>(null);

  // Expand to hash (and select) once data ready
  React.useEffect(() => {
    if (!roots.length) return;
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (hash && hash.startsWith("#unit-")) {
      const id = hash.replace("#unit-", "");
      const path = getPathToNode(roots, id);
      if (path.length) {
        setExpanded((s) => new Set([...s, ...path.map((p) => p.id)]));
        setSelected(path[path.length - 1]);
      }
    }
  }, [roots]);

  // Default select first root (keep hooks before any conditional return)
  React.useEffect(() => {
    if (!selected && roots.length) setSelected(roots[0]);
  }, [roots, selected]);

  const filterFn = React.useCallback(
    (n: StructureNode) => {
      if (!query) return true;
      const q = query.toLowerCase();
      const inSelf =
        n.name.toLowerCase().includes(q) ||
        TYPE_LABEL[n.type].toLowerCase().includes(q) ||
        [n.phone, n.email, n.address].some((x) => x?.toLowerCase().includes(q));
      const inEmp = normalizeEmployees(n.employees).some(
        (e) =>
          e.name?.toLowerCase().includes(q) ||
          e.position?.toLowerCase().includes(q) ||
          e.phone?.toLowerCase().includes(q) ||
          e.email?.toLowerCase().includes(q)
      );
      return inSelf || inEmp;
    },
    [query]
  );

  const filteredRoots = React.useMemo(() => {
    if (!query) return roots;
    const keep = (node: StructureNode): StructureNode | null => {
      const kids = node.children?.map(keep).filter(Boolean) as StructureNode[];
      const ok = filterFn(node);
      return ok || kids?.length ? { ...node, children: kids } : null;
    };
    return roots.map(keep).filter(Boolean) as StructureNode[];
  }, [roots, filterFn, query]);

  const onToggle = (id: string | number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const onSelect = (node: StructureNode) => {
    setSelected(node);
    const path = getPathToNode(roots, node.id);
    setExpanded((s) => new Set([...s, ...path.map((p) => p.id)]));
    if (typeof window !== "undefined")
      history.replaceState(null, "", `#unit-${node.id}`);
  };

  const expandAll = () => setExpanded(collectIds(roots));
  const collapseAll = () => setExpanded(new Set());

  // ---- Render ----
  return (
    <div className="w-full py-10" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mx-auto max-w-6xl space-y-6 px-4"
      >
        <header className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight">
              الهيكل التنظيمي
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              عرض هرمي للهيئة والإدارات والمراكز مع الموظفين وبيانات الاتصال.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={expandAll}>
              فتح الكل
            </Button>
            <Button variant="outline" onClick={collapseAll}>
              إغلاق الكل
            </Button>
            <Button
              variant="secondary"
              onClick={() => downloadJSON("structure.json", roots)}
            >
              <Download className="ml-2 h-4 w-4" /> تنزيل JSON
            </Button>
          </div>
        </header>

        {/* Top search */}
        <div className="relative">
          <Search className="pointer-events-none absolute right-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بالاسم أو النوع أو الموظفين أو الهاتف/العنوان"
            className="pr-9"
            aria-label="بحث"
          />
        </div>

        {/* Error / Loading lightweight handling inside UI */}
        {isError && (
          <Card>
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" /> حدث خطأ في تحميل البيانات.
              </div>
              <ErrorComponent error={error} keyParam="structures" />
              <Button
                variant="outline"
                className="mt-3"
                onClick={() => refetch()}
              >
                إعادة المحاولة
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Left: Tree */}
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" /> الشجرة التنظيمية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[540px] pr-2">
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-10 animate-pulse rounded-lg bg-muted" />
                    <div className="h-10 animate-pulse rounded-lg bg-muted" />
                    <div className="h-10 animate-pulse rounded-lg bg-muted" />
                  </div>
                ) : filteredRoots.length ? (
                  filteredRoots.map((r) => (
                    <TreeNode
                      key={r.id}
                      node={r}
                      expanded={expanded}
                      onToggle={onToggle}
                      onSelect={onSelect}
                      selectedId={selected?.id ?? null}
                      query={query}
                    />
                  ))
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border p-3 text-muted-foreground">
                    لا توجد نتائج مطابقة.
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Right: Details */}
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" /> تفاصيل الجهة المختارة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
                </div>
              ) : !selected ? (
                <div className="text-muted-foreground">
                  اختر عنصراً من الشجرة لعرض التفاصيل.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {React.createElement(TYPE_ICON[selected.type], {
                      className: "h-5 w-5",
                    })}
                    <h2 className="text-xl font-semibold truncate">
                      {selected.name}
                    </h2>
                    <Badge variant="outline">{TYPE_LABEL[selected.type]}</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mr-auto"
                      onClick={() => {
                        const url = `${window.location.origin}${window.location.pathname}#unit-${selected.id}`;
                        navigator.clipboard.writeText(url);
                      }}
                    >
                      <LinkIcon className="ml-2 h-4 w-4" /> نسخ الرابط
                    </Button>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {selected.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4" />{" "}
                        <span dir="ltr">{selected.phone}</span>
                      </div>
                    )}
                    {selected.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4" />{" "}
                        <a
                          href={`mailto:${selected.email}`}
                          className="underline"
                          dir="ltr"
                        >
                          {selected.email}
                        </a>
                      </div>
                    )}
                    {selected.address && (
                      <div className="flex items-center gap-2 text-sm sm:col-span-2">
                        <MapPin className="h-4 w-4" />{" "}
                        <span>{selected.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />{" "}
                      <h3 className="font-medium">الموظفون</h3>{" "}
                      <Badge variant="secondary" className="ml-auto">
                        {normalizeEmployees(selected.employees).length}
                      </Badge>
                    </div>
                    {normalizeEmployees(selected.employees).length ? (
                      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {normalizeEmployees(selected.employees).map((e, i) => (
                          <li key={i} className="rounded-lg border p-2">
                            <div className="text-sm font-semibold">
                              {e.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {e.position}
                            </div>
                            {e.phone && (
                              <div className="text-xs" dir="ltr">
                                {e.phone}
                              </div>
                            )}
                            {e.email && (
                              <div className="text-xs">
                                <a
                                  href={`mailto:${e.email}`}
                                  className="underline"
                                  dir="ltr"
                                >
                                  {e.email}
                                </a>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        لا يوجد موظفون مسجلون.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default StructurePage;

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { FiDownload, FiFilter, FiPrinter, FiSearch } from "react-icons/fi";
import { Navigate, useParams } from "react-router-dom";
import { useAdminOverview } from "../hooks/useAdminOverview";

type ReportType =
  | "dashboard-summary"
  | "student-allocation"
  | "guide-workload"
  | "unassigned-students"
  | "department-wise";

type ChartType = "bar" | "line" | "pie";

type ReportRow = Record<string, string | number>;

interface ReportConfig {
  id: ReportType;
  title: string;
  columns: { key: string; label: string }[];
  chartType: ChartType;
}

interface ChartDatum {
  label: string;
  value: number;
  color: string;
}

interface GeneratedReport {
  rows: ReportRow[];
  chartData: ChartDatum[];
}

const REPORT_CONFIGS: ReportConfig[] = [
  {
    id: "dashboard-summary",
    title: "Dashboard Summary",
    chartType: "pie",
    columns: [
      { key: "metric", label: "Metric" },
      { key: "value", label: "Value" },
      { key: "statusLabel", label: "Status" },
      { key: "notes", label: "Notes" },
    ],
  },
  {
    id: "student-allocation",
    title: "Student Allocation Report",
    chartType: "bar",
    columns: [
      { key: "fullName", label: "Student" },
      { key: "username", label: "Username" },
      { key: "class", label: "Class" },
      { key: "division", label: "Division" },
      { key: "rollNumber", label: "Roll Number" },
      { key: "projectCount", label: "Project Count" },
      { key: "statusLabel", label: "Allocation Status" },
    ],
  },
  {
    id: "guide-workload",
    title: "Guide Workload Report",
    chartType: "pie",
    columns: [
      { key: "fullName", label: "Guide" },
      { key: "departmentName", label: "Department" },
      { key: "statusLabel", label: "Status" },
      { key: "assignedProjects", label: "Assigned" },
      { key: "maxProjects", label: "Capacity" },
      { key: "remainingCapacity", label: "Remaining" },
      { key: "workloadBand", label: "Workload Band" },
    ],
  },
  {
    id: "unassigned-students",
    title: "Unassigned Students Report",
    chartType: "bar",
    columns: [
      { key: "fullName", label: "Student" },
      { key: "username", label: "Username" },
      { key: "class", label: "Class" },
      { key: "division", label: "Division" },
      { key: "rollNumber", label: "Roll Number" },
      { key: "statusLabel", label: "Status" },
    ],
  },
  {
    id: "department-wise",
    title: "Department-wise Report",
    chartType: "pie",
    columns: [
      { key: "departmentName", label: "Department" },
      { key: "guideCount", label: "Guides" },
      { key: "activeGuideCount", label: "Active Guides" },
      { key: "assignedProjects", label: "Assigned Projects" },
      { key: "remainingCapacity", label: "Remaining Capacity" },
      { key: "statusLabel", label: "Load Status" },
    ],
  },
];

const PAGE_SIZE = 8;

const CHART_COLORS = ["#0f766e", "#f59e0b", "#2563eb", "#dc2626", "#7c3aed", "#0891b2"];

const toCsvValue = (value: string | number) => {
  const normalized = String(value ?? "");
  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }

  return normalized;
};

const downloadCsv = (fileName: string, columns: { key: string; label: string }[], rows: ReportRow[]) => {
  const header = columns.map((column) => toCsvValue(column.label)).join(",");
  const body = rows.map((row) => columns.map((column) => toCsvValue(row[column.key] ?? "")).join(","));
  const csv = [header, ...body].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
};

const getWorkloadBand = (assignedProjects: number, maxProjects: number) => {
  if (maxProjects <= 0) return "No capacity set";
  const ratio = assignedProjects / maxProjects;
  if (ratio >= 1) return "Full";
  if (ratio >= 0.7) return "High";
  if (ratio >= 0.3) return "Moderate";
  if (ratio > 0) return "Light";
  return "Idle";
};

export default function ReportsPage() {
  const { reportType } = useParams<{ reportType: string }>();
  const { data, isLoading, isError } = useAdminOverview();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const selectedReport = (reportType as ReportType) || "dashboard-summary";
  const isValidReport = REPORT_CONFIGS.some((report) => report.id === selectedReport);
  const activeReport = REPORT_CONFIGS.find((report) => report.id === selectedReport) ?? REPORT_CONFIGS[0];

  useEffect(() => {
    setSearch("");
    setStatusFilter("all");
    setCurrentPage(1);
  }, [selectedReport]);

  const generatedReports = useMemo<Record<ReportType, GeneratedReport>>(() => {
    if (!data) {
      return {
        "dashboard-summary": { rows: [], chartData: [] },
        "student-allocation": { rows: [], chartData: [] },
        "guide-workload": { rows: [], chartData: [] },
        "unassigned-students": { rows: [], chartData: [] },
        "department-wise": { rows: [], chartData: [] },
      };
    }

    const allocatedStudents = data.studentActivity.filter((student) => student.isAssigned).length;
    const unassignedStudentsCount = data.studentActivity.filter((student) => !student.isAssigned).length;
    const departmentMap = new Map<
      string,
      {
        departmentName: string;
        guideCount: number;
        activeGuideCount: number;
        assignedProjects: number;
        remainingCapacity: number;
      }
    >();

    for (const guide of data.guideActivity) {
      const key = guide.departmentName || "Unspecified";
      const current = departmentMap.get(key) ?? {
        departmentName: key,
        guideCount: 0,
        activeGuideCount: 0,
        assignedProjects: 0,
        remainingCapacity: 0,
      };
      current.guideCount += 1;
      current.activeGuideCount += guide.isActive ? 1 : 0;
      current.assignedProjects += guide.assignedProjects;
      current.remainingCapacity += guide.remainingCapacity;
      departmentMap.set(key, current);
    }

    const departmentRows = Array.from(departmentMap.values()).map((department) => ({
      ...department,
      status: department.remainingCapacity === 0 ? "full" : department.assignedProjects > 0 ? "active" : "idle",
      statusLabel:
        department.remainingCapacity === 0
          ? "At capacity"
          : department.assignedProjects > 0
            ? "Handling allocations"
            : "No current load",
      searchText: department.departmentName.toLowerCase(),
    }));

    return {
      "dashboard-summary": {
        rows: [
          {
            metric: "Total Projects",
            value: data.summary.totalProjects,
            status: "neutral",
            statusLabel: "Tracked",
            notes: "All projects in the system.",
            searchText: "total projects tracked",
          },
          {
            metric: "Allocated Projects",
            value: data.summary.allocatedProjects,
            status: "healthy",
            statusLabel: "Healthy",
            notes: "Projects already assigned to guides.",
            searchText: "allocated projects healthy",
          },
          {
            metric: "Unallocated Projects",
            value: data.summary.unallocatedProjects,
            status: data.summary.unallocatedProjects > 0 ? "attention" : "healthy",
            statusLabel: data.summary.unallocatedProjects > 0 ? "Attention" : "Healthy",
            notes: "Projects waiting for allocation.",
            searchText: "unallocated projects attention",
          },
          {
            metric: "Students in Projects",
            value: data.summary.totalStudentActivities,
            status: "healthy",
            statusLabel: "Active",
            notes: "Students linked to projects.",
            searchText: "students in projects active",
          },
          {
            metric: "Guide Activity",
            value: data.summary.totalGuideActivities,
            status: "healthy",
            statusLabel: "Active",
            notes: "Guides currently handling work.",
            searchText: "guide activity active",
          },
        ],
        chartData: [
          { label: "Allocated", value: data.summary.allocatedProjects, color: CHART_COLORS[0] },
          { label: "Unallocated", value: data.summary.unallocatedProjects, color: CHART_COLORS[3] },
          { label: "Students Active", value: data.summary.totalStudentActivities, color: CHART_COLORS[2] },
        ],
      },
      "student-allocation": {
        rows: data.studentActivity.map((student) => ({
          fullName: student.fullName || student.username,
          username: student.username,
          class: student.class || "-",
          division: student.division || "-",
          rollNumber: student.rollNumber || "-",
          projectCount: student.projectCount,
          status: student.isAssigned ? "allocated" : "unassigned",
          statusLabel: student.isAssigned ? "Allocated" : "Unassigned",
          searchText: [
            student.fullName,
            student.username,
            student.class,
            student.division,
            student.rollNumber,
          ]
            .join(" ")
            .toLowerCase(),
        })),
        chartData: [
          { label: "Allocated", value: allocatedStudents, color: CHART_COLORS[0] },
          { label: "Unassigned", value: unassignedStudentsCount, color: CHART_COLORS[3] },
        ],
      },
      "guide-workload": {
        rows: data.guideActivity.map((guide) => ({
          fullName: guide.fullName,
          departmentName: guide.departmentName || "-",
          status: guide.isActive ? "active" : "inactive",
          statusLabel: guide.isActive ? "Active" : "Inactive",
          assignedProjects: guide.assignedProjects,
          maxProjects: guide.maxProjects,
          remainingCapacity: guide.remainingCapacity,
          workloadBand: getWorkloadBand(guide.assignedProjects, guide.maxProjects),
          searchText: [guide.fullName, guide.departmentName, guide.username].join(" ").toLowerCase(),
        })),
        chartData: data.guideActivity.slice(0, 8).map((guide, index) => ({
          label: guide.fullName,
          value: guide.assignedProjects,
          color: CHART_COLORS[index % CHART_COLORS.length],
        })),
      },
      "unassigned-students": {
        rows: data.studentActivity
          .filter((student) => !student.isAssigned)
          .map((student) => ({
            fullName: student.fullName || student.username,
            username: student.username,
            class: student.class || "-",
            division: student.division || "-",
            rollNumber: student.rollNumber || "-",
            status: "unassigned",
            statusLabel: "Available",
            searchText: [
              student.fullName,
              student.username,
              student.class,
              student.division,
              student.rollNumber,
            ]
              .join(" ")
              .toLowerCase(),
          })),
        chartData: Array.from(
          data.studentActivity
            .filter((student) => !student.isAssigned)
            .reduce((acc, student) => {
              const key = `${student.class || "-"} ${student.division || "-"}`.trim();
              acc.set(key, (acc.get(key) ?? 0) + 1);
              return acc;
            }, new Map<string, number>())
        )
          .slice(0, 8)
          .map(([label, value], index) => ({
            label,
            value,
            color: CHART_COLORS[index % CHART_COLORS.length],
          })),
      },
      "department-wise": {
        rows: departmentRows,
        chartData: departmentRows.map((department, index) => ({
          label: department.departmentName,
          value: Number(department.assignedProjects),
          color: CHART_COLORS[index % CHART_COLORS.length],
        })),
      },
    };
  }, [data]);

  const statusOptions = useMemo(() => {
    switch (selectedReport) {
      case "dashboard-summary":
        return [
          { value: "all", label: "All" },
          { value: "healthy", label: "Healthy" },
          { value: "attention", label: "Attention" },
          { value: "neutral", label: "Neutral" },
        ];
      case "student-allocation":
        return [
          { value: "all", label: "All" },
          { value: "allocated", label: "Allocated" },
          { value: "unassigned", label: "Unassigned" },
        ];
      case "guide-workload":
        return [
          { value: "all", label: "All" },
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ];
      case "unassigned-students":
        return [
          { value: "all", label: "All" },
          { value: "unassigned", label: "Available" },
        ];
      case "department-wise":
        return [
          { value: "all", label: "All" },
          { value: "active", label: "Handling allocations" },
          { value: "full", label: "At capacity" },
          { value: "idle", label: "No current load" },
        ];
    }
  }, [selectedReport]);

  const filteredRows = useMemo(() => {
    const rows = generatedReports[selectedReport]?.rows ?? [];
    const normalizedSearch = search.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesSearch =
        !normalizedSearch || String(row.searchText ?? "").includes(normalizedSearch);
      const matchesStatus = statusFilter === "all" || String(row.status ?? "") === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [generatedReports, search, selectedReport, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const paginatedRows = filteredRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const chartData = generatedReports[selectedReport]?.chartData ?? [];

  if (!isValidReport) {
    return <Navigate to="/admin/reports/dashboard-summary" replace />;
  }

  if (isLoading) {
    return <div className="py-16 text-center text-slate-500">Loading reports...</div>;
  }

  if (isError || !data) {
    return <div className="py-16 text-center text-red-600">Unable to load reports.</div>;
  }

  return (
    <section className="reports-shell space-y-6">
      <div className="reports-card rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_22px_70px_-32px_rgba(15,23,42,0.32)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/92">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{activeReport.title}</h1>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                downloadCsv(
                  `${selectedReport}-${new Date().toISOString().slice(0, 10)}.csv`,
                  activeReport.columns,
                  filteredRows
                )
              }
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <FiDownload />
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <FiPrinter />
              Print
            </button>
          </div>
        </div>

        <div className="reports-filters mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_160px]">
          <label className="relative block">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search"
              className="w-full rounded-2xl border border-slate-200 bg-white/90 py-3 pl-11 pr-4 text-sm outline-none transition focus:-translate-y-0.5 focus:border-amber-400 dark:border-slate-700 dark:bg-slate-950/85"
            />
          </label>

          <label className="relative block">
            <FiFilter className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-white/90 py-3 pl-11 pr-4 text-sm outline-none transition focus:-translate-y-0.5 focus:border-amber-400 dark:border-slate-700 dark:bg-slate-950/85"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:from-slate-950 dark:to-slate-900 dark:text-slate-300">
            {filteredRows.length} rows
          </div>
        </div>
      </div>

      <div className="reports-card reports-chart rounded-[2rem] border border-slate-200/80 bg-white/92 p-5 shadow-[0_22px_70px_-32px_rgba(15,23,42,0.32)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/92">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Analytics</h2>
        </div>
        <ReportChart type={activeReport.chartType} data={chartData} />
      </div>

      <div className="reports-card overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/94 shadow-[0_22px_70px_-32px_rgba(15,23,42,0.32)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/94">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
              <tr>
                {activeReport.columns.map((column) => (
                  <th key={column.key} className="px-5 py-4 text-left font-medium text-slate-500">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeReport.columns.length}
                    className="px-5 py-12 text-center text-slate-500 dark:text-slate-400"
                  >
                    No rows match the current filters.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, rowIndex) => (
                  <tr
                    key={`${selectedReport}-${rowIndex}`}
                    className="reports-row transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                    style={{ animationDelay: `${rowIndex * 55}ms` } as CSSProperties}
                  >
                    {activeReport.columns.map((column) => (
                      <td key={column.key} className="px-5 py-4 text-slate-700 dark:text-slate-200">
                        {String(row[column.key] ?? "-")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950/75 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950/75 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReportChart({ type, data }: { type: ChartType; data: ChartDatum[] }) {
  if (!data.length) {
    return <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">No chart data available.</div>;
  }

  if (type === "bar") {
    const max = Math.max(...data.map((item) => item.value), 1);
    return (
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={item.label} className="grid gap-2 sm:grid-cols-[180px_minmax(0,1fr)_60px] sm:items-center">
            <span className="truncate text-sm text-slate-600 dark:text-slate-300">{item.label}</span>
            <div className="reports-bar-track h-3 rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="reports-bar-fill h-full rounded-full shadow-[0_10px_24px_-12px_rgba(15,23,42,0.55)]"
                style={{
                  width: `${(item.value / max) * 100}%`,
                  backgroundColor: item.color,
                  animationDelay: `${index * 90}ms`,
                } as CSSProperties}
              />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.value}</span>
          </div>
        ))}
      </div>
    );
  }

  if (type === "line") {
    const width = 640;
    const height = 220;
    const padding = 24;
    const max = Math.max(...data.map((item) => item.value), 1);
    const points = data
      .map((item, index) => {
        const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
        const y = height - padding - (item.value / max) * (height - padding * 2);
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <div className="space-y-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full overflow-visible">
          <defs>
            <linearGradient id="reportsLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0f766e" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>
          <polyline
            className="reports-line"
            fill="none"
            stroke="url(#reportsLineGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
          {data.map((item, index) => {
            const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
            const y = height - padding - (item.value / max) * (height - padding * 2);
            return (
              <circle
                key={item.label}
                className="reports-line-dot"
                cx={x}
                cy={y}
                r="5"
                fill={item.color}
                style={{ animationDelay: `${index * 120 + 450}ms` } as CSSProperties}
              />
            );
          })}
        </svg>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {data.map((item) => (
            <div key={item.label} className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950">
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
              <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  let cumulative = 0;
  const slices = data.map((item) => {
    const startAngle = (cumulative / total) * Math.PI * 2;
    cumulative += item.value;
    const endAngle = (cumulative / total) * Math.PI * 2;
    return { ...item, startAngle, endAngle };
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-center">
      <svg viewBox="0 0 220 220" className="mx-auto h-64 w-64">
        {slices.map((slice, index) => (
          <path
            key={slice.label}
            className="reports-pie-slice"
            d={describeArc(110, 110, 78, slice.startAngle, slice.endAngle)}
            fill="none"
            stroke={slice.color}
            strokeWidth="40"
            strokeLinecap="round"
            style={{ animationDelay: `${index * 130}ms` } as CSSProperties}
          />
        ))}
      </svg>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div
            key={item.label}
            className="reports-pie-legend flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950"
            style={{ animationDelay: `${index * 90 + 180}ms` } as CSSProperties}
          >
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-slate-700 dark:text-slate-200">{item.label}</span>
            </div>
            <span className="text-sm font-semibold text-slate-800 dark:text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInRadians: number) {
  return {
    x: centerX + radius * Math.cos(angleInRadians - Math.PI / 2),
    y: centerY + radius * Math.sin(angleInRadians - Math.PI / 2),
  };
}

function describeArc(centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";
  return ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(" ");
}

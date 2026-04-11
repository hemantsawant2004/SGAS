import { useEffect, useMemo, useState } from "react";
import { FiCalendar, FiDownload, FiFileText, FiFilter, FiPrinter } from "react-icons/fi";
import { Navigate, useParams } from "react-router-dom";
import { useAdminOverview } from "../hooks/useAdminOverview";

type ReportType =
  | "dashboard-summary"
  | "student-allocation"
  | "guide-workload"
  | "unassigned-students"
  | "department-wise";

type ReportRow = Record<string, string | number>;

interface ReportMetric {
  label: string;
  value: string | number;
}

interface ReportConfig {
  id: ReportType;
  title: string;
  eyebrow: string;
  description: string;
  tone: string;
  columns: { key: string; label: string }[];
}

interface GeneratedReport {
  metrics: ReportMetric[];
  insights: string[];
  rows: ReportRow[];
}

const REPORT_CONFIGS: ReportConfig[] = [
  {
    id: "dashboard-summary",
    title: "Dashboard Summary Report",
    eyebrow: "Overview",
    description: "See the overall project, guide, student, and allocation health of the system in one report.",
    tone: "from-slate-950 via-slate-900 to-slate-800",
    columns: [
      { key: "metric", label: "Metric" },
      { key: "value", label: "Value" },
      { key: "status", label: "Status" },
      { key: "notes", label: "Notes" },
    ],
  },
  {
    id: "student-allocation",
    title: "Student Allocation Report",
    eyebrow: "Allocation",
    description: "Track which students are allocated to projects and how many project links each student has.",
    tone: "from-emerald-700 via-teal-700 to-cyan-700",
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
    eyebrow: "Capacity",
    description: "Review guide allocation load, active status, and capacity distribution across the system.",
    tone: "from-amber-700 via-orange-600 to-rose-600",
    columns: [
      { key: "fullName", label: "Guide" },
      { key: "departmentName", label: "Department" },
      { key: "status", label: "Status" },
      { key: "assignedProjects", label: "Assigned" },
      { key: "maxProjects", label: "Capacity" },
      { key: "remainingCapacity", label: "Remaining" },
      { key: "workloadBand", label: "Workload Band" },
    ],
  },
  {
    id: "unassigned-students",
    title: "Unassigned Students Report",
    eyebrow: "Availability",
    description: "List all students who are not currently attached to any project so they can be allocated quickly.",
    tone: "from-red-700 via-rose-700 to-orange-700",
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
    eyebrow: "Departments",
    description: "View project allocation and guide capacity grouped by department for department-level monitoring.",
    tone: "from-indigo-700 via-blue-700 to-sky-700",
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

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const toCsvValue = (value: string | number) => {
  const normalized = String(value ?? "");
  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }

  return normalized;
};

const buildCsv = (columns: { key: string; label: string }[], rows: ReportRow[]) => {
  const header = columns.map((column) => toCsvValue(column.label)).join(",");
  const body = rows.map((row) =>
    columns.map((column) => toCsvValue(row[column.key] ?? "")).join(",")
  );

  return [header, ...body].join("\n");
};

const downloadCsv = (fileName: string, columns: { key: string; label: string }[], rows: ReportRow[]) => {
  const csv = buildCsv(columns, rows);
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
  const [generatedAt, setGeneratedAt] = useState(() => new Date().toISOString());
  const selectedReport = (reportType as ReportType) || "dashboard-summary";

  const isValidReport = REPORT_CONFIGS.some((report) => report.id === selectedReport);

  useEffect(() => {
    setSearch("");
    setStatusFilter("all");
    setGeneratedAt(new Date().toISOString());
  }, [selectedReport]);

  const activeReport = REPORT_CONFIGS.find((report) => report.id === selectedReport) ?? REPORT_CONFIGS[0];

  const generatedReports = useMemo<Record<ReportType, GeneratedReport>>(() => {
    if (!data) {
      return {
        "dashboard-summary": { metrics: [], insights: [], rows: [] },
        "student-allocation": { metrics: [], insights: [], rows: [] },
        "guide-workload": { metrics: [], insights: [], rows: [] },
        "unassigned-students": { metrics: [], insights: [], rows: [] },
        "department-wise": { metrics: [], insights: [], rows: [] },
      };
    }

    const dashboardSummaryRows = [
      {
        metric: "Total Projects",
        value: data.summary.totalProjects,
        status: "healthy",
        notes: "All submitted projects in the system.",
        searchText: "total projects",
      },
      {
        metric: "Allocated Projects",
        value: data.summary.allocatedProjects,
        status: "healthy",
        notes: "Projects already matched with a guide.",
        searchText: "allocated projects",
      },
      {
        metric: "Unallocated Projects",
        value: data.summary.unallocatedProjects,
        status: data.summary.unallocatedProjects > 0 ? "attention" : "healthy",
        notes: "Projects still waiting for guide allocation.",
        searchText: "unallocated projects",
      },
      {
        metric: "Active Guides With Work",
        value: data.summary.totalGuideActivities,
        status: "healthy",
        notes: "Guides currently handling at least one project.",
        searchText: "active guides",
      },
      {
        metric: "Students in Projects",
        value: data.summary.totalStudentActivities,
        status: "healthy",
        notes: "Students currently linked to project work.",
        searchText: "students in projects",
      },
      {
        metric: "Allocation Alerts",
        value: data.allocationAlerts.length,
        status: data.allocationAlerts.length > 0 ? "attention" : "healthy",
        notes: "Projects needing manual admin allocation support.",
        searchText: "allocation alerts",
      },
    ];

    const studentAllocation = data.studentActivity.map((student) => ({
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
    }));

    const guideWorkload = data.guideActivity.map((guide) => ({
      fullName: guide.fullName,
      departmentName: guide.departmentName || "-",
      status: guide.isActive ? "active" : "inactive",
      assignedProjects: guide.assignedProjects,
      maxProjects: guide.maxProjects,
      remainingCapacity: guide.remainingCapacity,
      workloadBand: getWorkloadBand(guide.assignedProjects, guide.maxProjects),
      searchText: [guide.fullName, guide.departmentName, guide.username].join(" ").toLowerCase(),
    }));

    const unassignedStudents = data.studentActivity
      .filter((student) => !student.isAssigned)
      .map((student) => ({
      fullName: student.fullName || student.username,
      username: student.username,
      class: student.class || "-",
      division: student.division || "-",
      rollNumber: student.rollNumber || "-",
      status: "unassigned",
      statusLabel: "Available for allocation",
      searchText: [
        student.fullName,
        student.username,
        student.class,
        student.division,
        student.rollNumber,
      ]
        .join(" ")
        .toLowerCase(),
    }));

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

    const departmentWise = Array.from(departmentMap.values()).map((department) => ({
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
        metrics: [
          { label: "Projects", value: data.summary.totalProjects },
          { label: "Allocated", value: data.summary.allocatedProjects },
          { label: "Unallocated", value: data.summary.unallocatedProjects },
          { label: "Alerts", value: data.allocationAlerts.length },
        ],
        insights: [
          `${data.summary.allocatedProjects} of ${data.summary.totalProjects} projects are already allocated to guides.`,
          `${data.summary.totalStudentActivities} students are currently involved in project work.`,
          `${data.allocationAlerts.length} project${data.allocationAlerts.length === 1 ? "" : "s"} need admin attention for allocation issues.`,
        ],
        rows: dashboardSummaryRows,
      },
      "student-allocation": {
        metrics: [
          { label: "Students", value: data.studentActivity.length },
          { label: "Allocated", value: data.studentActivity.filter((student) => student.isAssigned).length },
          { label: "Unassigned", value: data.studentActivity.filter((student) => !student.isAssigned).length },
          {
            label: "Project Links",
            value: data.studentActivity.reduce((sum, student) => sum + student.projectCount, 0),
          },
        ],
        insights: [
          `${data.studentActivity.filter((student) => student.isAssigned).length} students are already allocated to projects.`,
          `${data.studentActivity.filter((student) => !student.isAssigned).length} students are still available for new allocations.`,
          `${new Set(data.studentActivity.map((student) => `${student.class || "-"}-${student.division || "-"}`)).size} class/division groups are represented in this allocation cycle.`,
        ],
        rows: studentAllocation,
      },
      "guide-workload": {
        metrics: [
          { label: "Guides", value: data.guideActivity.length },
          { label: "Active Guides", value: data.guideActivity.filter((guide) => guide.isActive).length },
          {
            label: "Near Capacity",
            value: data.guideActivity.filter(
              (guide) => guide.maxProjects > 0 && guide.assignedProjects / guide.maxProjects >= 0.7
            ).length,
          },
          {
            label: "Remaining Slots",
            value: data.guideActivity.reduce((sum, guide) => sum + guide.remainingCapacity, 0),
          },
        ],
        insights: [
          `${data.guideActivity.filter((guide) => guide.isActive).length} guides are active in the current cycle.`,
          `${data.guideActivity.filter((guide) => guide.remainingCapacity === 0 && guide.maxProjects > 0).length} guides have reached full capacity.`,
          `${data.guideActivity.reduce((sum, guide) => sum + guide.assignedProjects, 0)} total guide allocations are being managed right now.`,
        ],
        rows: guideWorkload,
      },
      "unassigned-students": {
        metrics: [
          { label: "Unassigned", value: unassignedStudents.length },
          { label: "Total Students", value: data.studentActivity.length },
          { label: "Allocated Students", value: data.studentActivity.filter((student) => student.isAssigned).length },
          { label: "Open Project Alerts", value: data.allocationAlerts.length },
        ],
        insights: [
          `${unassignedStudents.length} students can still be attached to new or pending projects.`,
          `${data.summary.unallocatedProjects} projects are unallocated, so these students may be needed soon.`,
          `${new Set(unassignedStudents.map((student) => `${student.class}-${student.division}`)).size} class/division groups have at least one unassigned student.`,
        ],
        rows: unassignedStudents,
      },
      "department-wise": {
        metrics: [
          { label: "Departments", value: departmentWise.length },
          { label: "Guides", value: data.guideActivity.length },
          { label: "Assigned Projects", value: departmentWise.reduce((sum, row) => sum + Number(row.assignedProjects), 0) },
          { label: "Remaining Capacity", value: departmentWise.reduce((sum, row) => sum + Number(row.remainingCapacity), 0) },
        ],
        insights: [
          `${departmentWise.length} departments are represented across guide profiles.`,
          `${departmentWise.filter((department) => department.status === "full").length} department${departmentWise.filter((department) => department.status === "full").length === 1 ? "" : "s"} are currently at full capacity.`,
          `${departmentWise.reduce((sum, row) => sum + Number(row.assignedProjects), 0)} project allocations are distributed across departments.`,
        ],
        rows: departmentWise,
      },
    };
  }, [data]);

  const statusOptions = useMemo(() => {
    switch (selectedReport) {
      case "dashboard-summary":
        return [
          { value: "all", label: "All metrics" },
          { value: "healthy", label: "Healthy" },
          { value: "attention", label: "Attention" },
        ];
      case "student-allocation":
        return [
          { value: "all", label: "All students" },
          { value: "allocated", label: "Allocated" },
          { value: "unassigned", label: "Unassigned" },
        ];
      case "guide-workload":
        return [
          { value: "all", label: "All guides" },
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ];
      case "unassigned-students":
        return [
          { value: "all", label: "All unassigned students" },
          { value: "unassigned", label: "Available for allocation" },
        ];
      case "department-wise":
        return [
          { value: "all", label: "All departments" },
          { value: "active", label: "Handling allocations" },
          { value: "full", label: "At capacity" },
          { value: "idle", label: "No current load" },
        ];
    }
  }, [selectedReport]);

  const displayedRows = useMemo(() => {
    const rows = generatedReports[selectedReport]?.rows ?? [];
    const normalizedSearch = search.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesSearch =
        !normalizedSearch || String(row.searchText ?? "").includes(normalizedSearch);
      const matchesStatus = statusFilter === "all" || String(row.status ?? "") === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [generatedReports, search, selectedReport, statusFilter]);

  const reportOutput = generatedReports[selectedReport];

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
    <section className="space-y-6">
      <div className={`overflow-hidden rounded-[2rem] bg-gradient-to-br ${activeReport.tone} p-6 text-white shadow-xl sm:p-8`}>
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.35em] text-white/70">{activeReport.eyebrow}</p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{activeReport.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
              {activeReport.description}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <HeroStat label="Total Projects" value={data.summary.totalProjects} />
            <HeroStat label="Open Alerts" value={data.allocationAlerts.length} />
            <HeroStat label="Generated" value={formatDateTime(generatedAt)} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <FiFileText className="text-slate-500" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Selected Report</h2>
            </div>
            <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{activeReport.eyebrow}</p>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                {activeReport.title}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {activeReport.description}
              </p>
              <p className="mt-4 text-xs text-slate-400">
                Choose another report from the sidebar dropdown.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <FiFilter className="text-slate-500" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Filters</h2>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                  Search
                </label>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search this report"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 dark:border-slate-700 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 dark:border-slate-700 dark:bg-slate-950"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setGeneratedAt(new Date().toISOString())}
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
              >
                Generate Report
              </button>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Generated Output</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                  {activeReport.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Built from current admin data. Use filters to refine the preview before exporting.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    downloadCsv(
                      `${selectedReport}-${new Date().toISOString().slice(0, 10)}.csv`,
                      activeReport.columns,
                      displayedRows
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <FiDownload />
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <FiPrinter />
                  Print
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 dark:bg-slate-800">
                <FiCalendar />
                Generated on {formatDateTime(generatedAt)}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-2 dark:bg-slate-800">
                {displayedRows.length} record{displayedRows.length === 1 ? "" : "s"} in preview
              </span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {reportOutput.metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{metric.label}</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{metric.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {reportOutput.insights.map((insight, index) => (
              <article
                key={`${selectedReport}-insight-${index}`}
                className="rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-950"
              >
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Insight {index + 1}</p>
                <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">{insight}</p>
              </article>
            ))}
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Report Preview</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Preview the generated report before export or print.
              </p>
            </div>

            {displayedRows.length === 0 ? (
              <div className="px-5 py-16 text-center text-sm text-slate-500 dark:text-slate-400">
                No rows match the current filters for this report.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                  <thead className="bg-slate-50 dark:bg-slate-950">
                    <tr>
                      {activeReport.columns.map((column) => (
                        <th
                          key={column.key}
                          className="px-5 py-4 text-left font-medium text-slate-500"
                        >
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {displayedRows.map((row, rowIndex) => (
                      <tr key={`${selectedReport}-${rowIndex}`} className="align-top">
                        {activeReport.columns.map((column) => (
                          <td
                            key={column.key}
                            className="px-5 py-4 text-slate-700 dark:text-slate-200"
                          >
                            {String(row[column.key] ?? "-")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[1.5rem] border border-white/15 bg-white/10 px-4 py-4 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.2em] text-white/70">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

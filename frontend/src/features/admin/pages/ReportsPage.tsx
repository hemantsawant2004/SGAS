import { useMemo, useState } from "react";
import { FiCalendar, FiDownload, FiFileText, FiFilter, FiPrinter } from "react-icons/fi";
import { useAdminOverview } from "../hooks/useAdminOverview";

type ReportType =
  | "project-summary"
  | "guide-workload"
  | "student-participation"
  | "allocation-alerts"
  | "completed-submissions";

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
    id: "project-summary",
    title: "Project Summary Report",
    eyebrow: "Operations",
    description: "Track project ownership, allocation, technology choices, and current phase progress.",
    tone: "from-slate-950 via-slate-900 to-slate-800",
    columns: [
      { key: "projectCode", label: "Project Code" },
      { key: "title", label: "Project" },
      { key: "creator", label: "Creator" },
      { key: "members", label: "Members" },
      { key: "technology", label: "Technology" },
      { key: "assignedGuide", label: "Assigned Guide" },
      { key: "phase", label: "Current Phase" },
      { key: "status", label: "Status" },
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
    id: "student-participation",
    title: "Student Participation Report",
    eyebrow: "Participation",
    description: "See which students are active in projects, grouped by class, division, and project involvement.",
    tone: "from-emerald-700 via-teal-700 to-cyan-700",
    columns: [
      { key: "fullName", label: "Student" },
      { key: "username", label: "Username" },
      { key: "class", label: "Class" },
      { key: "division", label: "Division" },
      { key: "rollNumber", label: "Roll Number" },
      { key: "projectCount", label: "Project Count" },
      { key: "status", label: "Status" },
    ],
  },
  {
    id: "allocation-alerts",
    title: "Allocation Alerts Report",
    eyebrow: "Exceptions",
    description: "Focus on projects that need manual intervention because guide allocation could not complete automatically.",
    tone: "from-red-700 via-rose-700 to-orange-700",
    columns: [
      { key: "projectTitle", label: "Project" },
      { key: "creatorName", label: "Creator" },
      { key: "preferredGuideName", label: "Preferred Guide" },
      { key: "issueCode", label: "Issue Code" },
      { key: "message", label: "Admin Note" },
    ],
  },
  {
    id: "completed-submissions",
    title: "Completed Submission Report",
    eyebrow: "Delivery",
    description: "Review completed projects, final submission availability, and close-out completion details.",
    tone: "from-indigo-700 via-blue-700 to-sky-700",
    columns: [
      { key: "projectCode", label: "Project Code" },
      { key: "title", label: "Project" },
      { key: "creator", label: "Creator" },
      { key: "assignedGuide", label: "Assigned Guide" },
      { key: "completedAt", label: "Completed At" },
      { key: "finalSubmission", label: "Final Submission" },
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

const formatPhaseLabel = (value?: string | null) => {
  if (!value) return "-";
  if (value === "Completed") return value;

  return value
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const formatMembers = (members?: Array<{ given_name?: string; username: string }>) =>
  members?.length
    ? members.map((member) => member.given_name || member.username).join(", ")
    : "No extra members";

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
  const { data, isLoading, isError } = useAdminOverview();
  const [selectedReport, setSelectedReport] = useState<ReportType>("project-summary");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [generatedAt, setGeneratedAt] = useState(() => new Date().toISOString());

  const activeReport = REPORT_CONFIGS.find((report) => report.id === selectedReport) ?? REPORT_CONFIGS[0];

  const generatedReports = useMemo<Record<ReportType, GeneratedReport>>(() => {
    if (!data) {
      return {
        "project-summary": { metrics: [], insights: [], rows: [] },
        "guide-workload": { metrics: [], insights: [], rows: [] },
        "student-participation": { metrics: [], insights: [], rows: [] },
        "allocation-alerts": { metrics: [], insights: [], rows: [] },
        "completed-submissions": { metrics: [], insights: [], rows: [] },
      };
    }

    const projects = data.projects.map((project) => ({
      projectCode: project.projectCode || "-",
      title: project.title,
      creator: project.creator?.given_name || project.creator?.username || "-",
      members: formatMembers(project.members),
      technology: project.technology || "-",
      assignedGuide:
        project.assignedGuide?.fullName || project.assignedGuide?.fullname || "Not allocated",
      phase: formatPhaseLabel(project.currentPhase),
      status: project.currentPhaseStatus || "pending",
      searchText: [
        project.title,
        project.projectCode,
        project.technology,
        project.creator?.given_name,
        project.creator?.username,
        project.assignedGuide?.fullName,
        project.assignedGuide?.fullname,
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

    const studentParticipation = data.studentActivity.map((student) => ({
      fullName: student.fullName || student.username,
      username: student.username,
      class: student.class || "-",
      division: student.division || "-",
      rollNumber: student.rollNumber || "-",
      projectCount: student.projectCount,
      status: student.isAssigned ? "active" : "inactive",
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

    const allocationAlerts = data.allocationAlerts.map((alert) => ({
      projectTitle: alert.projectTitle,
      creatorName: alert.creatorName,
      preferredGuideName: alert.preferredGuideName || "Not selected",
      issueCode: alert.issueCode,
      message: alert.message,
      status: "attention",
      searchText: [
        alert.projectTitle,
        alert.creatorName,
        alert.preferredGuideName,
        alert.issueCode,
        alert.message,
      ]
        .join(" ")
        .toLowerCase(),
    }));

    const completedSubmissions = data.projects
      .filter((project) => project.currentPhaseStatus === "completed")
      .map((project) => ({
        projectCode: project.projectCode || "-",
        title: project.title,
        creator: project.creator?.given_name || project.creator?.username || "-",
        assignedGuide:
          project.assignedGuide?.fullName || project.assignedGuide?.fullname || "Not allocated",
        completedAt: formatDateTime(project.completedAt),
        finalSubmission: project.finalSubmissionPdf?.fileName || "No PDF uploaded",
        status: project.finalSubmissionPdf?.fileName ? "available" : "missing",
        searchText: [
          project.projectCode,
          project.title,
          project.creator?.given_name,
          project.creator?.username,
          project.assignedGuide?.fullName,
          project.assignedGuide?.fullname,
          project.finalSubmissionPdf?.fileName,
        ]
          .join(" ")
          .toLowerCase(),
      }));

    return {
      "project-summary": {
        metrics: [
          { label: "Projects", value: projects.length },
          { label: "Allocated", value: data.summary.allocatedProjects },
          { label: "In Progress", value: data.projects.filter((item) => item.currentPhaseStatus === "in_progress").length },
          { label: "Completed", value: data.projects.filter((item) => item.currentPhaseStatus === "completed").length },
        ],
        insights: [
          `${data.summary.allocatedProjects} of ${data.summary.totalProjects} projects are already allocated to guides.`,
          `${data.summary.unallocatedProjects} project${data.summary.unallocatedProjects === 1 ? "" : "s"} still need allocation attention.`,
          `${data.projects.filter((item) => item.currentPhaseStatus === "completed").length} project${data.projects.filter((item) => item.currentPhaseStatus === "completed").length === 1 ? "" : "s"} have completed the full lifecycle.`,
        ],
        rows: projects,
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
      "student-participation": {
        metrics: [
          { label: "Students", value: data.studentActivity.length },
          { label: "Active in Projects", value: data.studentActivity.filter((student) => student.isAssigned).length },
          { label: "Without Projects", value: data.studentActivity.filter((student) => !student.isAssigned).length },
          {
            label: "Project Links",
            value: data.studentActivity.reduce((sum, student) => sum + student.projectCount, 0),
          },
        ],
        insights: [
          `${data.studentActivity.filter((student) => student.isAssigned).length} students are currently attached to at least one project.`,
          `${data.studentActivity.filter((student) => !student.isAssigned).length} students are still available for new project formation.`,
          `${new Set(data.studentActivity.map((student) => `${student.class || "-"}-${student.division || "-"}`)).size} class/division groups are represented in the current student list.`,
        ],
        rows: studentParticipation,
      },
      "allocation-alerts": {
        metrics: [
          { label: "Open Alerts", value: data.allocationAlerts.length },
          {
            label: "No Active Guide",
            value: data.allocationAlerts.filter((alert) => alert.issueCode === "noActiveGuides").length,
          },
          {
            label: "Capacity Exhausted",
            value: data.allocationAlerts.filter((alert) => alert.issueCode === "noCapacity").length,
          },
          {
            label: "Review Required",
            value: data.allocationAlerts.length,
          },
        ],
        insights: [
          data.allocationAlerts.length
            ? `${data.allocationAlerts.length} projects are waiting for manual allocation support from admin.`
            : "There are no active allocation alerts right now.",
          `${data.allocationAlerts.filter((alert) => alert.preferredGuideName).length} alert${data.allocationAlerts.filter((alert) => alert.preferredGuideName).length === 1 ? "" : "s"} include a preferred guide choice.`,
          `${data.summary.unallocatedProjects} projects remain unallocated across the system.`,
        ],
        rows: allocationAlerts,
      },
      "completed-submissions": {
        metrics: [
          { label: "Completed Projects", value: completedSubmissions.length },
          {
            label: "PDF Available",
            value: completedSubmissions.filter((project) => project.status === "available").length,
          },
          {
            label: "Missing PDF",
            value: completedSubmissions.filter((project) => project.status === "missing").length,
          },
          { label: "Completion Rate", value: `${data.summary.totalProjects ? Math.round((completedSubmissions.length / data.summary.totalProjects) * 100) : 0}%` },
        ],
        insights: [
          `${completedSubmissions.length} projects have been marked as completed.`,
          `${completedSubmissions.filter((project) => project.status === "available").length} completed project${completedSubmissions.filter((project) => project.status === "available").length === 1 ? "" : "s"} already have a final submission file.`,
          `${completedSubmissions.filter((project) => project.status === "missing").length} completed project${completedSubmissions.filter((project) => project.status === "missing").length === 1 ? "" : "s"} still need a final submission document.`,
        ],
        rows: completedSubmissions,
      },
    };
  }, [data]);

  const statusOptions = useMemo(() => {
    switch (selectedReport) {
      case "project-summary":
        return [
          { value: "all", label: "All statuses" },
          { value: "pending", label: "Pending" },
          { value: "in_progress", label: "In Progress" },
          { value: "completed", label: "Completed" },
        ];
      case "guide-workload":
        return [
          { value: "all", label: "All guides" },
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ];
      case "student-participation":
        return [
          { value: "all", label: "All students" },
          { value: "active", label: "Active in project" },
          { value: "inactive", label: "No project" },
        ];
      case "allocation-alerts":
        return [
          { value: "all", label: "All alerts" },
          { value: "attention", label: "Needs attention" },
        ];
      case "completed-submissions":
        return [
          { value: "all", label: "All submissions" },
          { value: "available", label: "PDF available" },
          { value: "missing", label: "PDF missing" },
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
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Report Templates</h2>
            </div>
            <div className="mt-4 space-y-3">
              {REPORT_CONFIGS.map((report) => {
                const isActive = report.id === selectedReport;

                return (
                  <button
                    key={report.id}
                    type="button"
                    onClick={() => {
                      setSelectedReport(report.id);
                      setStatusFilter("all");
                      setSearch("");
                    }}
                    className={`w-full rounded-3xl border p-4 text-left transition ${
                      isActive
                        ? "border-slate-900 bg-slate-900 text-white dark:border-slate-200 dark:bg-slate-100 dark:text-slate-950"
                        : "border-slate-200 bg-slate-50/80 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700"
                    }`}
                  >
                    <p className="text-sm font-semibold">{report.title}</p>
                    <p className={`mt-2 text-xs leading-5 ${isActive ? "text-white/75 dark:text-slate-600" : "text-slate-500 dark:text-slate-400"}`}>
                      {report.description}
                    </p>
                  </button>
                );
              })}
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

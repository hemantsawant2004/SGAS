import { useMemo, useState } from "react";
import { useAdminOverview } from "../hooks/useAdminOverview";

type ReportType =
  | "project-summary"
  | "guide-workload"
  | "student-participation"
  | "allocation-alerts"
  | "completed-submissions";

type ReportRow = Record<string, string | number>;

interface ReportConfig {
  id: ReportType;
  label: string;
  description: string;
  columns: { key: string; label: string }[];
}

const REPORT_CONFIGS: ReportConfig[] = [
  {
    id: "project-summary",
    label: "Project Summary",
    description: "All projects with ownership, guide allocation, and phase status.",
    columns: [
      { key: "projectCode", label: "Project Code" },
      { key: "title", label: "Title" },
      { key: "creator", label: "Creator" },
      { key: "members", label: "Members" },
      { key: "technology", label: "Technology" },
      { key: "preferredGuide", label: "Preferred Guide" },
      { key: "assignedGuide", label: "Assigned Guide" },
      { key: "currentPhase", label: "Current Phase" },
      { key: "phaseStatus", label: "Phase Status" },
      { key: "completedAt", label: "Completed At" },
    ],
  },
  {
    id: "guide-workload",
    label: "Guide Workload",
    description: "Guide allocation load, active status, and remaining capacity.",
    columns: [
      { key: "fullName", label: "Guide" },
      { key: "departmentName", label: "Department" },
      { key: "username", label: "Username" },
      { key: "status", label: "Status" },
      { key: "assignedProjects", label: "Assigned Projects" },
      { key: "maxProjects", label: "Max Projects" },
      { key: "remainingCapacity", label: "Remaining Capacity" },
    ],
  },
  {
    id: "student-participation",
    label: "Student Participation",
    description: "Student involvement, class details, and project participation status.",
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
    label: "Allocation Alerts",
    description: "Projects needing manual admin action because auto-allocation failed.",
    columns: [
      { key: "projectTitle", label: "Project" },
      { key: "creatorName", label: "Creator" },
      { key: "preferredGuideName", label: "Preferred Guide" },
      { key: "issueCode", label: "Issue Code" },
      { key: "message", label: "Message" },
    ],
  },
  {
    id: "completed-submissions",
    label: "Completed Submissions",
    description: "Projects that have reached completion and include final submission metadata.",
    columns: [
      { key: "projectCode", label: "Project Code" },
      { key: "title", label: "Title" },
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

export default function ReportsPage() {
  const { data, isLoading, isError } = useAdminOverview();
  const [selectedReport, setSelectedReport] = useState<ReportType>("project-summary");

  const reportRows = useMemo<Record<ReportType, ReportRow[]>>(() => {
    const projects =
      data?.projects.map((project) => ({
        projectCode: project.projectCode || "-",
        title: project.title,
        creator: project.creator?.given_name || project.creator?.username || "-",
        members: formatMembers(project.members),
        technology: project.technology || "-",
        preferredGuide:
          project.preferredGuide?.fullName || project.preferredGuide?.fullname || "-",
        assignedGuide:
          project.assignedGuide?.fullName || project.assignedGuide?.fullname || "Not allocated",
        currentPhase: project.currentPhase || "-",
        phaseStatus: project.currentPhaseStatus || "-",
        completedAt: formatDateTime(project.completedAt),
      })) ?? [];

    const guideWorkload =
      data?.guideActivity.map((guide) => ({
        fullName: guide.fullName,
        departmentName: guide.departmentName || "-",
        username: guide.username,
        status: guide.isActive ? "Active" : "Inactive",
        assignedProjects: guide.assignedProjects,
        maxProjects: guide.maxProjects,
        remainingCapacity: guide.remainingCapacity,
      })) ?? [];

    const studentParticipation =
      data?.studentActivity.map((student) => ({
        fullName: student.fullName || student.username,
        username: student.username,
        class: student.class || "-",
        division: student.division || "-",
        rollNumber: student.rollNumber || "-",
        projectCount: student.projectCount,
        status: student.isAssigned ? "Active in project" : "No project",
      })) ?? [];

    const allocationAlerts =
      data?.allocationAlerts.map((alert) => ({
        projectTitle: alert.projectTitle,
        creatorName: alert.creatorName,
        preferredGuideName: alert.preferredGuideName || "Not selected",
        issueCode: alert.issueCode,
        message: alert.message,
      })) ?? [];

    const completedSubmissions =
      data?.projects
        .filter((project) => project.currentPhaseStatus === "completed")
        .map((project) => ({
          projectCode: project.projectCode || "-",
          title: project.title,
          creator: project.creator?.given_name || project.creator?.username || "-",
          assignedGuide:
            project.assignedGuide?.fullName || project.assignedGuide?.fullname || "Not allocated",
          completedAt: formatDateTime(project.completedAt),
          finalSubmission: project.finalSubmissionPdf?.fileName || "No PDF uploaded",
        })) ?? [];

    return {
      "project-summary": projects,
      "guide-workload": guideWorkload,
      "student-participation": studentParticipation,
      "allocation-alerts": allocationAlerts,
      "completed-submissions": completedSubmissions,
    };
  }, [data]);

  const activeReport = REPORT_CONFIGS.find((report) => report.id === selectedReport) ?? REPORT_CONFIGS[0];
  const rows = reportRows[selectedReport];

  if (isLoading) {
    return <div className="py-16 text-center text-slate-500">Loading reports...</div>;
  }

  if (isError || !data) {
    return <div className="py-16 text-center text-red-600">Unable to load reports.</div>;
  }

  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Admin reports</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Generate different report types from live admin activity data and export the current view as CSV.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            downloadCsv(
              `${selectedReport}-${new Date().toISOString().slice(0, 10)}.csv`,
              activeReport.columns,
              rows
            )
          }
          className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
        >
          Export CSV
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Projects" value={data.summary.totalProjects} />
        <SummaryCard label="Allocated" value={data.summary.allocatedProjects} />
        <SummaryCard label="Students Active" value={data.summary.totalStudentActivities} />
        <SummaryCard label="Alerts" value={data.allocationAlerts.length} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {REPORT_CONFIGS.map((report) => {
          const isActive = report.id === selectedReport;
          return (
            <button
              key={report.id}
              type="button"
              onClick={() => setSelectedReport(report.id)}
              className={`rounded-3xl border p-5 text-left shadow-sm transition ${
                isActive
                  ? "border-slate-900 bg-slate-900 text-white dark:border-slate-200 dark:bg-slate-100 dark:text-slate-950"
                  : "border-slate-200 bg-white text-slate-900 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:hover:border-slate-700"
              }`}
            >
              <p className="text-base font-semibold">{report.label}</p>
              <p
                className={`mt-2 text-sm leading-6 ${
                  isActive ? "text-slate-200 dark:text-slate-700" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {report.description}
              </p>
              <p
                className={`mt-4 text-xs uppercase tracking-[0.24em] ${
                  isActive ? "text-slate-300 dark:text-slate-600" : "text-slate-400"
                }`}
              >
                {reportRows[report.id].length} rows
              </p>
            </button>
          );
        })}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{activeReport.label}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{activeReport.description}</p>
        </div>

        {rows.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
            No records are available for this report type right now.
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
                {rows.map((row, rowIndex) => (
                  <tr key={`${selectedReport}-${rowIndex}`}>
                    {activeReport.columns.map((column) => (
                      <td
                        key={column.key}
                        className="px-5 py-4 align-top text-slate-700 dark:text-slate-200"
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
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

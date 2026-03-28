import { useMemo, useState } from "react";
import {
  useAdminOverview,
  useDeleteProject,
  useManualProjectGuideAssignment,
} from "../hooks/useAdminOverview";
import { FaTrash } from "react-icons/fa";
import { api } from "../../../app/config/axios.config";
import type { Project } from "../../projects/services/projects.service";

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

const getFileUrl = (fileUrl?: string | null) => {
  if (!fileUrl) return null;

  const baseUrl =
    typeof api.defaults.baseURL === "string"
      ? api.defaults.baseURL
      : window.location.origin;
  const apiRoot = baseUrl.replace(/\/api\/?$/, "");

  return fileUrl.startsWith("http")
    ? fileUrl
    : `${apiRoot}${fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`}`;
};

const getGuideDisplayName = (project: Project) =>
  project.assignedGuide?.fullName ||
  project.assignedGuide?.fullname ||
  "Not allocated";

const getPreferredGuideName = (project: Project) =>
  project.preferredGuide?.fullName || project.preferredGuide?.fullname || "-";

const getCreatorName = (project: Project) =>
  project.creator?.given_name || project.creator?.username || "-";

const getMemberNames = (project: Project) =>
  project.members?.length
    ? project.members
      .map((member) => member.given_name || member.username)
      .join(", ")
    : "No extra members";

const getStatusBadgeClass = (status?: string | null) => {
  if (status === "completed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300";
  }

  if (status === "in_progress") {
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-300";
  }

  return "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300";
};

export default function AdminProjectActivityPage() {
  const { data, isLoading, isError } = useAdminOverview();
  const [search, setSearch] = useState("");
  const [selectedGuides, setSelectedGuides] = useState<Record<number, string>>(
    {}
  );
  const { mutate: assignGuide, isPending: isAssigning } =
    useManualProjectGuideAssignment();
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();

  const filteredProjects = useMemo(() => {
    const projects = data?.projects ?? [];

    return projects.filter((project) => {
      const creator =
        project.creator?.given_name || project.creator?.username || "";
      const guide =
        project.assignedGuide?.fullName ||
        project.assignedGuide?.fullname ||
        project.preferredGuide?.fullName ||
        project.preferredGuide?.fullname ||
        "";
      const code = project.projectCode || "";
      const status = `${project.currentPhase || ""} ${project.currentPhaseStatus || ""
        }`;

      return `${project.title} ${creator} ${guide} ${project.technology} ${code} ${status}`
        .toLowerCase()
        .includes(search.toLowerCase());
    });
  }, [data?.projects, search]);

  const activeGuides = useMemo(
    () => (data?.guideActivity ?? []).filter((guide) => guide.isActive),
    [data?.guideActivity]
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-slate-200 bg-white px-4 text-center text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        Loading project activity...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-red-200 bg-red-50 px-4 text-center text-red-600 shadow-sm dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
        Unable to load project activity.
      </div>
    );
  }

  return (
    <section className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Admin Dashboard
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl dark:text-white">
              Project Activity
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Track project allocation, guide assignment, submissions, and
              student activity in one place.
            </p>
          </div>

          <div className="w-full lg:max-w-sm">
            <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">
              Search
            </label>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by project, student, guide or technology"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total projects"
          value={data.summary.totalProjects}
          helper="All submitted projects"
        />
        <StatCard
          label="Allocated"
          value={data.summary.allocatedProjects}
          helper="Projects with assigned guide"
        />
        <StatCard
          label="Unallocated"
          value={data.summary.unallocatedProjects}
          helper="Projects requiring action"
        />
      </div>

      {/* Alerts */}
      {data.allocationAlerts.length ? (
        <div className="rounded-[28px] border border-amber-300 bg-amber-50 p-5 shadow-sm sm:p-6 dark:border-amber-800 dark:bg-amber-950/30">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-amber-950 dark:text-amber-100">
                Admin Notification
              </h2>
              <p className="mt-1 text-sm text-amber-900 dark:text-amber-200">
                Some projects could not be auto-allocated because guide capacity
                is full or no guide is currently available.
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              {data.allocationAlerts.length} alert
              {data.allocationAlerts.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="mt-5 grid gap-3">
            {data.allocationAlerts.map((alert) => (
              <div
                key={alert.projectId}
                className="rounded-2xl border border-amber-200 bg-white/80 px-4 py-4 dark:border-amber-900 dark:bg-slate-900/70"
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {alert.projectTitle} | {alert.creatorName}
                </p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                  {alert.message}
                </p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Preferred guide: {alert.preferredGuideName || "Not selected"}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Mobile / Tablet Cards */}
      <div className="grid gap-4 xl:hidden">
        {filteredProjects.length ? (
          filteredProjects.map((project) => {
            const isPending = !(project as any).guideId && !project.assignedGuide;
            const selectedGuideId =
              selectedGuides[project.id] ??
              String(
                (project as any).guideId ??
                project.assignedGuide?.id ??
                project.preferredGuide?.id ??
                ""
              );

            const finalSubmissionUrl = getFileUrl(
              project.finalSubmissionPdf?.fileUrl
            );
            const hasFinalSubmissionPdf =
              project.finalSubmissionPdf?.fileMimeType === "application/pdf" &&
              Boolean(finalSubmissionUrl);

            return (
              <article
                key={project.id}
                className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="border-b border-slate-100 px-4 py-4 sm:px-5 dark:border-slate-800">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="line-clamp-2 text-base font-semibold text-slate-900 sm:text-lg dark:text-white">
                        {project.title}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Code: {project.projectCode || "-"}
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                        project.currentPhaseStatus
                      )}`}
                    >
                      {formatPhaseLabel(project.currentPhase)}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <DetailItem label="Technology" value={project.technology || "-"} />
                    <DetailItem label="Student Team" value={getCreatorName(project)} />
                    <DetailItem label="Members" value={getMemberNames(project)} />
                    <DetailItem
                      label="Preferred Guide"
                      value={getPreferredGuideName(project)}
                    />
                    <DetailItem
                      label="Allocated Guide"
                      value={getGuideDisplayName(project)}
                    />
                    <DetailItem
                      label="Completed At"
                      value={
                        project.completedAt
                          ? formatDateTime(project.completedAt)
                          : "-"
                      }
                    />
                  </div>

                  {(project as any).allocationIssue ? (
                    <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
                      {(project as any).allocationIssue.message}
                    </p>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-3">
                    {hasFinalSubmissionPdf && finalSubmissionUrl ? (
                      <a
                        href={finalSubmissionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        View PDF
                      </a>
                    ) : (
                      <span className="inline-flex items-center rounded-2xl border border-dashed border-slate-300 px-4 py-2.5 text-sm text-slate-400 dark:border-slate-700 dark:text-slate-500">
                        Final submission pending
                      </span>
                    )}
                  </div>

                  <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                    {isPending ? (
                      <>
                        <select
                          value={selectedGuideId}
                          onChange={(event) =>
                            setSelectedGuides((current) => ({
                              ...current,
                              [project.id]: event.target.value,
                            }))
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900"
                        >
                          <option value="">Select active guide</option>
                          {activeGuides.map((guide) => (
                            <option key={guide.id} value={guide.id}>
                              {guide.fullName} ({guide.assignedProjects}/
                              {guide.maxProjects})
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          disabled={isAssigning || !selectedGuideId}
                          onClick={() =>
                            assignGuide({
                              projectId: project.id,
                              guideId: Number(selectedGuideId),
                            })
                          }
                          className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
                        >
                          {isAssigning ? "Assigning..." : "Assign guide"}
                        </button>
                      </>
                    ) : (
                      <div className="inline-flex w-fit rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                        Already allocated
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => deleteProject(project.id)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/20"
                    >
                      <FaTrash />
                      {isDeleting ? "Deleting..." : "Delete project"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden xl:block">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {filteredProjects.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-[1320px] divide-y divide-slate-200 text-sm dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-950">
                  <tr>
                    <th className="px-5 py-4 text-left font-semibold text-slate-500">
                      Project
                    </th>
                    <th className="px-5 py-4 text-left font-semibold text-slate-500">
                      Project Code
                    </th>
                    <th className="px-5 py-4 text-left font-semibold text-slate-500">
                      Technology
                    </th>
                    <th className="px-5 py-4 text-left font-semibold text-slate-500">
                      Student Team
                    </th>
                    <th className="px-5 py-4 text-left font-semibold text-slate-500">
                      Preferred Guide
                    </th>
                    <th className="px-5 py-4 text-left font-semibold text-slate-500">
                      Allocated Guide
                    </th>
                    <th className="px-5 py-4 text-left font-semibold text-slate-500">
                      Status
                    </th>
                    <th className="px-5 py-4 text-left font-semibold text-slate-500">
                      Final Submission
                    </th>
                    <th className="px-5 py-4 text-left font-semibold text-slate-500">
                      Pending Action
                    </th>
                    <th className="px-5 py-4 text-left font-semibold text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredProjects.map((project) => {
                    const isPending =
                      !(project as any).guideId && !project.assignedGuide;
                    const selectedGuideId =
                      selectedGuides[project.id] ??
                      String(
                        (project as any).guideId ??
                        project.assignedGuide?.id ??
                        project.preferredGuide?.id ??
                        ""
                      );

                    const finalSubmissionUrl = getFileUrl(
                      project.finalSubmissionPdf?.fileUrl
                    );
                    const hasFinalSubmissionPdf =
                      project.finalSubmissionPdf?.fileMimeType ===
                      "application/pdf" && Boolean(finalSubmissionUrl);

                    return (
                      <tr
                        key={project.id}
                        className="align-top transition hover:bg-slate-50/70 dark:hover:bg-slate-800/30"
                      >
                        <td className="px-5 py-4">
                          <p className="max-w-[220px] font-semibold text-slate-900 dark:text-white">
                            {project.title}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                          {project.projectCode || "-"}
                        </td>

                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                          {project.technology || "-"}
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-900 dark:text-white">
                            {getCreatorName(project)}
                          </p>
                          <p className="mt-2 max-w-[220px] text-xs leading-5 text-slate-500 dark:text-slate-400">
                            Members: {getMemberNames(project)}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                          {getPreferredGuideName(project)}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            {getGuideDisplayName(project)}
                          </span>
                          {(project as any).allocationIssue ? (
                            <p className="mt-2 max-w-xs text-xs leading-5 text-amber-700 dark:text-amber-300">
                              {(project as any).allocationIssue.message}
                            </p>
                          ) : null}
                        </td>

                        <td className="px-5 py-4">
                          <div className="space-y-2">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                                project.currentPhaseStatus
                              )}`}
                            >
                              {formatPhaseLabel(project.currentPhase)}
                            </span>
                            {project.completedAt ? (
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Completed on {formatDateTime(project.completedAt)}
                              </p>
                            ) : null}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {hasFinalSubmissionPdf && finalSubmissionUrl ? (
                            <a
                              href={finalSubmissionUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                              View PDF
                            </a>
                          ) : (
                            <span className="text-sm text-slate-400 dark:text-slate-500">
                              Pending
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {isPending ? (
                            <div className="flex min-w-[250px] flex-col gap-2">
                              <select
                                value={selectedGuideId}
                                onChange={(event) =>
                                  setSelectedGuides((current) => ({
                                    ...current,
                                    [project.id]: event.target.value,
                                  }))
                                }
                                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900"
                              >
                                <option value="">Select active guide</option>
                                {activeGuides.map((guide) => (
                                  <option key={guide.id} value={guide.id}>
                                    {guide.fullName} ({guide.assignedProjects}/
                                    {guide.maxProjects})
                                  </option>
                                ))}
                              </select>

                              <button
                                type="button"
                                disabled={isAssigning || !selectedGuideId}
                                onClick={() =>
                                  assignGuide({
                                    projectId: project.id,
                                    guideId: Number(selectedGuideId),
                                  })
                                }
                                className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
                              >
                                {isAssigning ? "Assigning..." : "Assign guide"}
                              </button>
                            </div>
                          ) : (
                            <span className="inline-flex rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                              Already allocated
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => deleteProject(project.id)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/20"
                            title="Delete project"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: number;
  helper?: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
        {value}
      </p>
      {helper ? (
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-950/60">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm leading-5 text-slate-700 dark:text-slate-200">
        {value || "-"}
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center px-4 py-10 text-center">
      <p className="text-lg font-semibold text-slate-900 dark:text-white">
        No matching projects found
      </p>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
        Try searching with another project title, guide name, student name, or
        technology keyword.
      </p>
    </div>
  );
}
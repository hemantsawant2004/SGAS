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
    typeof api.defaults.baseURL === "string" ? api.defaults.baseURL : window.location.origin;
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
    ? project.members.map((member) => member.given_name || member.username).join(", ")
    : "No extra members";

export default function AdminProjectActivityPage() {
  const { data, isLoading, isError } = useAdminOverview();
  const [search, setSearch] = useState("");
  const [selectedGuides, setSelectedGuides] = useState<Record<number, string>>({});
  const { mutate: assignGuide, isPending: isAssigning } = useManualProjectGuideAssignment();
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();

  const filteredProjects = useMemo(() => {
    const projects = data?.projects ?? [];
    return projects.filter((project) => {
      const creator = project.creator?.given_name || project.creator?.username || "";
      const guide =
        project.assignedGuide?.fullName ||
        project.assignedGuide?.fullname ||
        project.preferredGuide?.fullName ||
        project.preferredGuide?.fullname ||
        "";
      const code = project.projectCode || "";
      const status = `${project.currentPhase || ""} ${project.currentPhaseStatus || ""}`;

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
    return <div className="py-16 text-center text-slate-500">Loading project activity...</div>;
  }

  if (isError || !data) {
    return <div className="py-16 text-center text-red-600">Unable to load project activity.</div>;
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          {/* <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Admin</p> */}
          {/* <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
            Project activity
          </h1> */}
        </div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search project, student or guide"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 md:max-w-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total projects" value={data.summary.totalProjects} />
        <StatCard label="Allocated" value={data.summary.allocatedProjects} />
        <StatCard label="Unallocated" value={data.summary.unallocatedProjects} />
      </div>

      {data.allocationAlerts.length ? (
        <div className="rounded-3xl border border-amber-300 bg-amber-50 p-6 shadow-sm dark:border-amber-800 dark:bg-amber-950/30">
          <h2 className="text-lg font-semibold text-amber-950 dark:text-amber-100">
            Admin notification
          </h2>
          <p className="mt-2 text-sm text-amber-900 dark:text-amber-200">
            Some projects could not be auto-allocated because guide capacity is exhausted or no
            guide is currently available.
          </p>
          <div className="mt-4 space-y-3">
            {data.allocationAlerts.map((alert) => (
              <div
                key={alert.projectId}
                className="rounded-2xl border border-amber-200 bg-white/70 px-4 py-3 dark:border-amber-900 dark:bg-slate-900/70"
              >
                <p className="font-medium text-slate-900 dark:text-white">
                  {alert.projectTitle} | {alert.creatorName}
                </p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{alert.message}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Preferred guide: {alert.preferredGuideName || "Not selected"}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-4 p-4 lg:hidden">
          {filteredProjects.map((project) => {
            const isPending = !(project as any).guideId && !project.assignedGuide;
            const selectedGuideId =
              selectedGuides[project.id] ??
              String(
                (project as any).guideId ??
                  project.assignedGuide?.id ??
                  project.preferredGuide?.id ??
                  ""
              );
            const finalSubmissionUrl = getFileUrl(project.finalSubmissionPdf?.fileUrl);
            const hasFinalSubmissionPdf =
              project.finalSubmissionPdf?.fileMimeType === "application/pdf" &&
              Boolean(finalSubmissionUrl);

            return (
              <article
                key={project.id}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-950/70"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {project.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Code: {project.projectCode || "-"}
                    </p>
                  </div>
                  <span
                    className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${
                      project.currentPhaseStatus === "completed"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300"
                        : project.currentPhaseStatus === "in_progress"
                          ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-300"
                          : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300"
                    }`}
                  >
                    {formatPhaseLabel(project.currentPhase)}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <DetailItem label="Technology" value={project.technology} />
                  <DetailItem label="Student Team" value={getCreatorName(project)} />
                  <DetailItem label="Members" value={getMemberNames(project)} />
                  <DetailItem label="Preferred Guide" value={getPreferredGuideName(project)} />
                  <DetailItem label="Allocated Guide" value={getGuideDisplayName(project)} />
                  <DetailItem
                    label="Completed At"
                    value={project.completedAt ? formatDateTime(project.completedAt) : "-"}
                  />
                </div>

                {(project as any).allocationIssue ? (
                  <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
                    {(project as any).allocationIssue.message}
                  </p>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-3">
                  {hasFinalSubmissionPdf && finalSubmissionUrl ? (
                    <a
                      href={finalSubmissionUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      View PDF
                    </a>
                  ) : (
                    <span className="inline-flex rounded-2xl border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-400 dark:border-slate-700 dark:text-slate-500">
                      Final submission pending
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
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
                        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                      >
                        <option value="">Select active guide</option>
                        {activeGuides.map((guide) => (
                          <option key={guide.id} value={guide.id}>
                            {guide.fullName} ({guide.assignedProjects}/{guide.maxProjects})
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
                    <span className="inline-flex rounded-2xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                      Already allocated
                    </span>
                  )}

                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => deleteProject(project.id)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/20"
                  >
                    <FaTrash />
                    Delete project
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="min-w-[1280px] divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950">
              <tr>
                <th className="px-5 py-4 text-left font-medium text-slate-500">Project</th>
                <th className="px-5 py-4 text-left font-medium text-slate-500">Project Code</th>
                <th className="px-5 py-4 text-left font-medium text-slate-500">Technology</th>
                <th className="px-5 py-4 text-left font-medium text-slate-500">Student Team</th>
                <th className="px-5 py-4 text-left font-medium text-slate-500">Preferred Guide</th>
                <th className="px-5 py-4 text-left font-medium text-slate-500">Allocated Guide</th>
                <th className="px-5 py-4 text-left font-medium text-slate-500">Status</th>
                <th className="px-5 py-4 text-left font-medium text-slate-500">Final Submission</th>
                <th className="px-5 py-4 text-left font-medium text-slate-500">Pending action</th>
                <th className="px-5 py-4 text-left font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredProjects.map((project) => {
                const isPending = !(project as any).guideId && !project.assignedGuide;
                const selectedGuideId =
                  selectedGuides[project.id] ??
                  String((project as any).guideId ?? project.assignedGuide?.id ?? project.preferredGuide?.id ?? "");
                const finalSubmissionUrl = getFileUrl(project.finalSubmissionPdf?.fileUrl);
                const hasFinalSubmissionPdf =
                  project.finalSubmissionPdf?.fileMimeType === "application/pdf" &&
                  Boolean(finalSubmissionUrl);

                return (
                <tr key={project.id}>

                  <td className="px-5 py-4 align-top">
                    <p className="font-medium text-slate-800 dark:text-white">{project.title}</p>
                  </td>

                  <td className="px-5 py-4 align-top text-slate-600 dark:text-slate-300">
                    {project.projectCode || "-"}
                  </td>

                  <td className="px-5 py-4 align-top text-slate-600 dark:text-slate-300">
                    {project.technology}
                  </td>

                  <td className="px-5 py-4 align-top">
                    <p className="font-medium text-slate-800 dark:text-white">
                      {getCreatorName(project)}
                    </p>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Members:{" "}
                      {getMemberNames(project)}
                    </p>
                  </td>

                  <td className="px-5 py-4 align-top text-slate-600 dark:text-slate-500">
                    {getPreferredGuideName(project)}
                  </td>

                  <td className="px-5 py-4 align-top">
                    <span className="rounded-full px-3 py-1 text-xs font-medium text-black dark:text-white">
                      {getGuideDisplayName(project)}
                    </span>
                    {(project as any).allocationIssue ? (
                      <p className="mt-2 max-w-xs text-xs text-amber-700 dark:text-amber-300">
                        {(project as any).allocationIssue.message}
                      </p>
                    ) : null}
                  </td>
                  
                  <td className="px-5 py-4 align-top">
                    <div className="space-y-2">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${project.currentPhaseStatus === "completed"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300"
                        : project.currentPhaseStatus === "in_progress"
                          ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-300"
                          : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300"}`}>
                        {formatPhaseLabel(project.currentPhase)}
                      </span>
                      {project.completedAt ? (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Completed on {formatDateTime(project.completedAt)}
                        </p>
                      ) : null}
                    </div>
                  </td>

                  <td className="px-5 py-4 align-top">
                    {hasFinalSubmissionPdf && finalSubmissionUrl ? (
                      <a
                        href={finalSubmissionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        View PDF
                      </a>
                    ) : (
                      <span className="text-sm text-slate-400 dark:text-slate-500">Pending</span>
                    )}
                  </td>

                  <td className="px-5 py-4 align-top">
                    {isPending ? (
                      <div className="flex min-w-[240px] flex-col gap-2">
                        <select
                          value={selectedGuideId}
                          onChange={(event) =>
                            setSelectedGuides((current) => ({
                              ...current,
                              [project.id]: event.target.value,
                            }))
                          }
                          className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                        >
                          <option value="">Select active guide</option>
                          {activeGuides.map((guide) => (
                            <option key={guide.id} value={guide.id}>
                              {guide.fullName} ({guide.assignedProjects}/{guide.maxProjects})
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
                          className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
                        >
                          {isAssigning ? "Assigning..." : "Assign guide"}
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-emerald-700 dark:text-emerald-300">
                        Already allocated
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4 align-top">
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => deleteProject(project.id)}
                      className="px-4 py-2 text-sm font-medium text-red-600 transition disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-300"
                    >
                      {/* {isDeleting ? "Deleting..." : "Delete"} */}<FaTrash/>
                    </button>
                  </td>

                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{value}</p>
    </div>
  );
}

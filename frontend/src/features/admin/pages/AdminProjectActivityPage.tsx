import { useMemo, useState } from "react";
import {
  useAdminOverview,
  useDeleteProject,
  useManualProjectGuideAssignment,
} from "../hooks/useAdminOverview";

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

      return `${project.title} ${creator} ${guide} ${project.technology}`
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
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
            Project activity
          </h1>
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
                  {alert.projectTitle} · {alert.creatorName}
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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950">
              <tr>
                <th className="px-5 py-4 text-left font-medium text-slate-500">Project</th>
                <th className="px-5 py-4 text-left font-medium text-slate-500">Technology</th>
                <th className="px-5 py-4 text-left font-medium text-slate-500">Student Team</th>
                <th className="px-5 py-4 text-left font-medium text-slate-500">Preferred Guide</th>
                <th className="px-5 py-4 text-left font-medium text-slate-500">Allocated Guide</th>
                <th className="px-5 py-4 text-left font-medium text-slate-500">Pending action</th>
                <th className="px-5 py-4 text-left font-medium text-slate-500">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredProjects.map((project) => {
                const isPending = !(project as any).guideId && !project.assignedGuide;
                const selectedGuideId =
                  selectedGuides[project.id] ??
                  String((project as any).guideId ?? project.assignedGuide?.id ?? project.preferredGuide?.id ?? "");

                return (
                <tr key={project.id}>
                  <td className="px-5 py-4 align-top">
                    <p className="font-medium text-slate-800 dark:text-white">{project.title}</p>
                    {/* <p className="mt-1 text-xs text-slate-500">{project.technology}</p> */}
                  </td>
                  <td className="px-5 py-4 align-top">
                     <p className="mt-1 text-xs text-slate-100">{project.technology}</p>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <p className="font-medium text-slate-800 dark:text-white">
                      {project.creator?.given_name || project.creator?.username || "-"}
                    </p>
                    {/* <p className="mt-2 text-xs text-slate-500">
                      Members:{" "}
                      {project.members?.length
                        ? project.members
                            .map((member) => member.given_name || member.username)
                            .join(", ")
                        : "No extra members"}
                    </p> */}
                  </td>
                  <td className="px-5 py-4 align-top text-slate-600 dark:text-slate-500">
                    {project.preferredGuide?.fullName || project.preferredGuide?.fullname || "-"}
                  </td>
                  <td className="px-5 py-4 align-top">
                    <span className="rounded-full px-3 py-1 text-xs font-medium text-black dark:text-white">
                      {project.assignedGuide?.fullName ||
                        project.assignedGuide?.fullname ||
                        "Not allocated"}
                    </span>
                    {(project as any).allocationIssue ? (
                      <p className="mt-2 max-w-xs text-xs text-amber-700 dark:text-amber-300">
                        {(project as any).allocationIssue.message}
                      </p>
                    ) : null}
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
                      className="rounded-2xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/30"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
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

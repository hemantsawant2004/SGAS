import { Link } from "react-router-dom";
import { useDeleteProject } from "../../admin/hooks/useAdminOverview";
import { useGuideProjects } from "../../projects/hooks/useProjects";
import { BackButton } from "../../../Components/formcomponents/BackButtonComponent";

export default function GuideAllocatedProjectsPage() {
  const { data: projects = [], isLoading, isError } = useGuideProjects();
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();

  if (isLoading) {
    return <div className="animate-pulse py-20 text-center text-sm font-medium text-slate-500">Loading allocated projects...</div>;
  }

  if (isError) {
    return <div className="py-20 text-center text-sm font-medium text-red-500">Unable to load allocated projects.</div>;
  }

  return (
    <>

      <section className="space-y-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-6">
            <BackButton />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Allocated Projects</h1>
          </div>

        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 ml-12">
          Total of {projects.length} projects under your guidance
        </p>
        {projects.length ? (
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-950">
                  <tr>
                    <th className="px-5 py-4 text-left font-semibold text-slate-500">Project</th>
                    <th className="px-5 py-4 text-left font-semibold text-slate-500">Creator</th>
                    <th className="px-5 py-4 text-left font-semibold text-slate-500">Members</th>
                    <th className="px-5 py-4 text-left font-semibold text-slate-500">Technology</th>
                    <th className="px-5 py-4 text-left font-semibold text-slate-500">Project Code</th>
                    <th className="px-5 py-4 text-left font-semibold text-slate-500">Phase Status</th>
                    <th className="px-5 py-4 text-left font-semibold text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {projects.map((project) => {
                    const completedCount = project.phaseStatuses?.filter((entry) => entry.status === "completed").length ?? 0;
                    const totalPhases = project.phaseStatuses?.length ?? 6;
                    const memberNames = project.members?.length
                      ? project.members.map((member) => member.given_name || member.username).join(", ")
                      : "No extra members";

                    return (
                      <tr key={project.id} className="align-top">
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{project.title}</p>
                            {/* <p className="mt-1 max-w-md text-xs leading-5 text-slate-500 dark:text-slate-400">
                              {project.description}
                            </p> */}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                          {project.creator?.given_name || project.creator?.username || "-"}
                        </td>

                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                          {/* <p>{project.members?.length ? `${project.members.length} member(s)` : "Solo"}</p> */}
                          <p className="mt-1 max-w-xs text-xs text-slate-500 dark:text-slate-400">{memberNames}</p>
                        </td>

                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{project.technology}</td>

                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                          {project.projectCode || "-"}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                            {completedCount}/{totalPhases} completed
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              to={`/guide/projects/${project.id}/progress`}
                              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                            >
                              Open Progress
                            </Link>
                            <button
                              type="button"
                              disabled={isDeleting}
                              onClick={() => deleteProject(project.id)}
                              className="inline-flex items-center justify-center rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/30"
                            >
                              {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-800">
            <p className="text-sm text-slate-500">No projects currently allocated.</p>
          </div>
        )}
      </section>
    </>);
}

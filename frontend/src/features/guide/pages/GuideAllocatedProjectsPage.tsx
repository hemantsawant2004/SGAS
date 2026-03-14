import { useGuideProjects } from "../../projects/hooks/useProjects";
import { useDeleteProject } from "../../admin/hooks/useAdminOverview";

export default function GuideAllocatedProjectsPage() {
  const { data: projects = [], isLoading, isError } = useGuideProjects();
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();

  if (isLoading) {
    return <div className="py-20 text-center text-sm font-medium text-slate-500 animate-pulse">Loading allocated projects...</div>;
  }

  if (isError) {
    return <div className="py-20 text-center text-sm font-medium text-red-500">Unable to load allocated projects.</div>;
  }

  return (
    <section className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Allocated Projects</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total of {projects.length} projects under your guidance</p>
        </div>
      </div>

      {projects.length ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/50">
                  <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">Project Details</th>
                  <th className="hidden px-6 py-4 font-semibold text-slate-900 dark:text-slate-100 md:table-cell">Technology</th>
                  <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">Team</th>
                  <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">Lead</th>
                  <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {projects.map((project) => (
                  <tr 
                    key={project.id} 
                    className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  >
                    {/* Project & Description */}
                    <td className="px-6 py-5 align-top">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {project.title}
                        </span>
                        <span className="line-clamp-1 max-w-xs text-xs text-slate-500 dark:text-slate-400">
                          {project.description}
                        </span>
                      </div>
                    </td>

                    {/* Technology Badge */}
                    <td className="hidden px-6 py-5 align-middle md:table-cell">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {project.technology}
                      </span>
                    </td>

                    {/* Team Members (Avatar-style list) */}
                    <td className="px-6 py-5 align-middle">
                      <div className="flex -space-x-2 overflow-hidden">
                        {project.members?.length ? (
                          project.members.map((member) => (
                            <div 
                              key={member.id} 
                              title={member.given_name || member.username}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[10px] font-bold text-slate-700 dark:border-slate-900 dark:bg-slate-700 dark:text-slate-200"
                            >
                              {(member.given_name || member.username)[0].toUpperCase()}
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">Solo</span>
                        )}
                      </div>
                    </td>

                    {/* Lead Person */}
                    <td className="px-6 py-5 align-middle">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {project.creator?.given_name || project.creator?.username || "-"}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Creator</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-middle">
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => deleteProject(project.id)}
                        className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/30"
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
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
  );
}

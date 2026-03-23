import { Link, useParams } from "react-router-dom";
import ProjectProgressPanel from "../../projects/components/ProjectProgressPanel";
import { useMyProjects } from "../../projects/hooks/useProjects";

export default function StudentProjectProgressPage() {
  const params = useParams();
  const projectId = Number(params.projectId);
  const { data: projects = [], isLoading, isError } = useMyProjects();

  if (isLoading) {
    return <div className="py-16 text-center text-slate-500">Loading project progress...</div>;
  }

  if (isError) {
    return <div className="py-16 text-center text-red-600">Unable to load project progress.</div>;
  }

  const project = projects.find((entry) => entry.id === projectId);

  if (!project) {
    return (
      <section className="space-y-6">
        <Link
          to="/student/projects"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
         ← Back to My Projects
        </Link>
        <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-slate-700">
          Project not found.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="overflow-hidden rounded-[34px]  bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* <div className="ml-5 mb-5">
        <BackButton/>
        </div> */}
        <div className="bg-[radial-gradient(circle_at_top_left,_rgba(148,163,184,0.18),_transparent_45%),linear-gradient(135deg,_rgba(15,23,42,0.04),_rgba(15,23,42,0))] p-6 dark:bg-[radial-gradient(circle_at_top_left,_rgba(148,163,184,0.12),_transparent_45%),linear-gradient(135deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0))] lg:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-4">
              <Link
                to="/student/projects"
                className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                ← Back to My Projects
              </Link>
              <div>
                {/* <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Progress Workspace</p> */}
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white lg:text-4xl">
                  {project.title}
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 border-t border-slate-200 p-6 dark:border-slate-800 lg:grid-cols-1 lg:p-8">
          <div className="space-y-6">
            <ProjectProgressPanel project={project} mode="student" />
          </div>
        </div>
      </div>
    </section>
  );
}

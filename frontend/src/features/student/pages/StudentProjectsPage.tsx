import ProjectCard from "../../projects/components/ProjectCard";
import { useMyProjects } from "../../projects/hooks/useProjects";

export default function StudentProjectsPage() {
  const { data: projects = [], isLoading, isError } = useMyProjects();

  if (isLoading) {
    return <div className="py-16 text-center text-slate-500">Loading projects...</div>;
  }

  if (isError) {
    return <div className="py-16 text-center text-red-600">Unable to load projects.</div>;
  }

  return (
    <section className="space-y-8">
      {/* <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Student</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
          My submitted projects
        </h1>
      </div> */}

      {projects.length ? (
        <div className="grid gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700">
          No project submitted yet.
        </div>
      )}
    </section>
  );
}

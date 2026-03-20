import { Link } from "react-router-dom";
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
      {projects.length ? (
        <div className="grid gap-6">
          {projects.map((project) => {
            const assignedGuideName =
              project.assignedGuide?.fullName || project.assignedGuide?.fullname || null;
            const isAssignedGuideInactive =
              Boolean(assignedGuideName) && project.assignedGuide?.isActive === false;
            const allPhasesCompleted =
              project.phaseStatuses?.length
                ? project.phaseStatuses.every((entry) => entry.status === "completed")
                : false;
            const isProgressDisabled =
              allPhasesCompleted || !assignedGuideName || isAssignedGuideInactive;

            return (
              <div key={project.id} className="rounded-[28px] bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <ProjectCard project={project} />
                <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-950/40">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Progress Submission</p>
                    <p className="mt-1 text-sm font-bold text-black dark:text-slate-400">
                      {allPhasesCompleted
                        ? "Congratulations ! Your Project is Completed."
                        : isAssignedGuideInactive
                          ? `${assignedGuideName} is inactive right now. Progress submission is disabled until admin reactivates your guide.`
                        : assignedGuideName
                          ? `Send your report progress and attachments to ${assignedGuideName}.`
                          : "Submit progress after a guide is allocated to this project."}
                    </p>
                  </div>
                  <Link
                    to={`/student/projects/${project.id}/progress`}
                    className={`inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition ${isProgressDisabled
                      ? "pointer-events-none border border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500"
                      : "bg-slate-900 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"}`}
                  >
                    {allPhasesCompleted ? "Completed" : "Submit Progress"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700">
          No project submitted yet.
        </div>
      )}
    </section>
  );
}


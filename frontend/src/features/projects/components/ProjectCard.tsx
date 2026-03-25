import type { Project } from "../services/projects.service";

const guideName = (guide?: { fullName?: string; fullname?: string } | null) =>
  guide?.fullName ?? guide?.fullname ?? "Not assigned";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {project.title}
          </h3>
          {/* <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {project.description}
          </p> */}
        </div>
      </div>

      <div className="mt-5 grid gap-4 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Creator</p>
          <p className="mt-1 font-medium text-slate-800 dark:text-white">
            {project.creator?.given_name || project.creator?.username || "-"}
          </p>
        </div>
           <div className="mt-2 flex flex-wrap gap-2">
          {project.members?.length ? (
            project.members.map((member) => (
              <span
                key={member.id}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {member.given_name || member.username}
              </span>
            ))
          ) : (
            <span className="text-sm text-slate-500">No extra members</span>
          )}
        </div>
        {/* <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Preferred Guide</p>
          <p className="mt-1 font-medium text-slate-800 dark:text-white">
            {guideName(project.preferredGuide)}
          </p>
        </div> */}
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Assigned Guide</p>
          <p className="mt-1 font-medium text-slate-800 dark:text-white">
            {guideName(project.assignedGuide)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Project Code</p>
          <p className="mt-1 font-medium text-slate-800 dark:text-white">
            {project.projectCode || "Generating..."}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Project Technology</p>
          <p className="mt-1 font-medium text-slate-800 dark:text-white">
            {project.technology}
          </p>
        </div>
      </div>
    </article>
  );
}


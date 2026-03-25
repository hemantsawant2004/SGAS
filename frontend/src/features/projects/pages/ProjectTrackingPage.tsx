import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppSelector } from "../../../app/hooks";
import ProjectCard from "../components/ProjectCard";
import { useProjectTracking } from "../hooks/useProjects";
import { BackButton } from "../../../Components/formcomponents/BackButtonComponent";

const normalizeCode = (value: string) => value.trim().toUpperCase();

const formatPhaseLabel = (value?: string | null) => {
  if (!value) return "-";
  if (value === "Completed") return value;

  return value
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export default function ProjectTrackingPage() {
  const navigate = useNavigate();
  const params = useParams();
  const user = useAppSelector((state) => state.auth.user);
  const projectCode = normalizeCode(params.projectCode ?? "");
  const [searchCode, setSearchCode] = useState(projectCode);
  const { data, isLoading, isError, error } = useProjectTracking(projectCode);

  useEffect(() => {
    setSearchCode(projectCode);
  }, [projectCode]);

  const backPath = useMemo(() => {
    if (user?.role === "admin") return "/admin/projects";
    if (user?.role === "guide") return "/guide/allocatedprojects";
    return "/student/projects";
  }, [user?.role]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = normalizeCode(searchCode);

    if (!normalized) return;
    navigate(`/projects/track/${normalized}`);
  };

  return (
    <section className="space-y-8">
      <div className="overflow-hidden rounded-[34px] bg-white shadow-sm dark:bg-slate-900">
        <div className="bg-[radial-gradient(circle_at_top_left,_rgba(148,163,184,0.18),_transparent_45%),linear-gradient(135deg,_rgba(15,23,42,0.04),_rgba(15,23,42,0))] p-6 dark:bg-[radial-gradient(circle_at_top_left,_rgba(148,163,184,0.12),_transparent_45%),linear-gradient(135deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0))] lg:p-8">
          <div className="space-y-4">
            <div className="flex gap-6">
              <Link
                to={backPath}
                className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <BackButton />
              </Link>

              <p className="text-xl font-semibold font-mono tracking-tight text-slate-600 dark:text-white">
                Track Projects
              </p>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
              <input
                value={searchCode}
                onChange={(event) => setSearchCode(event.target.value.toUpperCase())}
                placeholder="Enter project code, e.g; PRJ-2026-0044-D2AEC1"
                className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <button
                type="submit"
                disabled={!normalizeCode(searchCode)}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Track
              </button>
            </form>
          </div>
        </div>

        {projectCode ? (
          <div className="border-t border-slate-200 p-6 dark:border-slate-800 lg:p-8">
            {isLoading ? (
              <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-slate-700">
                Loading project tracking...
              </div>
            ) : isError ? (
              <div className="rounded-3xl border border-dashed border-rose-300 p-12 text-center text-rose-600 dark:border-rose-900 dark:text-rose-300">
                {(error as any)?.response?.data?.message || "Unable to find a project for this code."}
              </div>
            ) : data ? (
              <div className="space-y-6">
                <ProjectCard project={data.project} />
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950/40">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Current Phase
                  </p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                        {formatPhaseLabel(data.project.currentPhase)}
                      </h2>
                      {/* <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Current live phase of this project.
                      </p> */}
                    </div>
                    <span
                      className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${data.project.currentPhaseStatus === "completed"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300"
                        : data.project.currentPhaseStatus === "in_progress"
                          ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-300"
                          : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"}`}
                    >
                      {(data.project.currentPhaseStatus || "pending").replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

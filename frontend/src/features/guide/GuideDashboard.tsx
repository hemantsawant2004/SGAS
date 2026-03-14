import { useMyGuideProfile } from "./hooks/useGuide";
import { useGuideProjects } from "../projects/hooks/useProjects";
import { useAppSelector } from "../../app/hooks";

export default function GuideDashboard() {
  const username = useAppSelector((state) => state.auth.user?.username);
  const { data: profile } = useMyGuideProfile(username);
  const { data: projects = [] } = useGuideProjects();

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Guide</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
          Guide dashboard
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* <Card label="Profile status" value={profile ? "Created" : "Pending"} /> */}
        <Card label="Allocated projects" value={String(projects.length)} />
        {/* <Card label="Department" value={profile?.departmentName || "-"} /> */}
      </div>
    </section>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useStudentGuides } from "./hooks/useStudentGuides";
import { useMyProjects } from "../projects/hooks/useProjects";

export default function StudentDashboard() {
  const { data: guides = [] } = useStudentGuides();
  const { data: projects = [] } = useMyProjects();
  const allocatedProjects = projects.filter((project) => Boolean(project.assignedGuide));
  const allocationNoticeKey = useMemo(
    () =>
      allocatedProjects
        .map((project) => `${project.id}:${project.assignedGuide?.id ?? project.assignedGuide?.fullName ?? ""}`)
        .sort()
        .join("|"),
    [allocatedProjects]
  );
  const [showAllocationNotice, setShowAllocationNotice] = useState(false);

  useEffect(() => {
    if (!allocationNoticeKey) {
      setShowAllocationNotice(false);
      return;
    }

    const storageKey = `student-allocation-notice:${allocationNoticeKey}`;
    const hasSeenNotice = window.sessionStorage.getItem(storageKey) === "seen";

    if (hasSeenNotice) {
      setShowAllocationNotice(false);
      return;
    }

    setShowAllocationNotice(true);
    window.sessionStorage.setItem(storageKey, "seen");
  }, [allocationNoticeKey]);

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Student</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
          Student dashboard
        </h1>
      </div>

      {showAllocationNotice ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
          Your project has been allocated to a guide. Check your project page to view the assigned guide.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card label="Available guides" value={String(guides.length)} />
        <Card label="Submitted projects" value={String(projects.length)} />
        <Card
          label="Next action"
          value={projects.length ? "Project Submitted" : "Submit project"}
        />
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

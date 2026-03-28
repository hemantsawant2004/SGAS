import { useAdminOverview } from "../hooks/useAdminOverview";

export default function AdminGuideActivityPage() {
  const { data, isLoading, isError } = useAdminOverview();

  if (isLoading) {
    return <div className="py-16 text-center text-slate-500">Loading guide activity...</div>;
  }

  if (isError || !data) {
    return <div className="py-16 text-center text-red-600">Unable to load guide activity.</div>;
  }

  return (
    <section className="space-y-6 sm:space-y-8">
      <div>
        {/* <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Admin</p> */}
        {/* <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
          Guide activity
        </h1> */}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Guides with work" value={data.summary.totalGuideActivities} />
        <StatCard
          label="Total assigned load"
          value={data.guideActivity.reduce((sum, guide) => sum + guide.assignedProjects, 0)}
        />
        <StatCard
          label="Remaining capacity"
          value={data.guideActivity.reduce((sum, guide) => sum + guide.remainingCapacity, 0)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {data.guideActivity.map((guide) => (
          <article
            key={guide.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {guide.fullName}
                </h2>
                <p className="mt-1 text-sm text-slate-500">{guide.departmentName}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  guide.isActive
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {guide.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Metric label="Assigned" value={guide.assignedProjects} />
              <Metric label="Max" value={guide.maxProjects} />
              <Metric label="Capacity Left" value={guide.remainingCapacity} />
            </div>
          </article>
        ))}
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

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

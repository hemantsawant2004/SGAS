import { useAdminOverview } from "./hooks/useAdminOverview";

export default function AdminDashboard() {
  const { data, isLoading, isError } = useAdminOverview();

  if (isLoading) {
    return <div className="py-16 text-center text-slate-500">Loading admin activity...</div>;
  }

  if (isError || !data) {
    return <div className="py-16 text-center text-red-600">Unable to load admin activity.</div>;
  }

  return (
    <section className="space-y-6 sm:space-y-8">
      <div>
        {/* <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Admin</p> */}
        {/* <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
          Operations dashboard
        </h1> */}
        {/* <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          This is the summary view. Detailed project, guide, and student activity now live on separate admin tabs.
        </p> */}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <DashboardCard label="Total projects" value={data.summary.totalProjects} />
        <DashboardCard label="Allocated Projects" value={data.summary.allocatedProjects} />
        <DashboardCard label="Unallocated Projects" value={data.summary.unallocatedProjects} />
        <DashboardCard label="Active guides" value={data.summary.totalGuideActivities} />
        <DashboardCard label="Total students" value={data.summary.totalStudentActivities} />
      </div>

      {/* {data.allocationAlerts.length ? (
        <div className="rounded-3xl border border-amber-300 bg-amber-50 p-6 text-amber-950 shadow-sm dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
          <h2 className="text-lg font-semibold">Allocation attention required</h2>
          <p className="mt-2 text-sm leading-6">
            {data.allocationAlerts.length} project
            {data.allocationAlerts.length > 1 ? "s are" : " is"} waiting for manual admin action
            because no guide could be auto-allocated.
          </p>
        </div>
      ) : null} */}

      {/* <div className="grid gap-4 lg:grid-cols-3">
        <InfoCard
          title="Project Activity"
          text="Open the dedicated project tab to inspect all student project allocations."
        />
        <InfoCard
          title="Guide Activity"
          text="Use the guide activity tab to monitor allocation load and remaining capacity."
        />
        <InfoCard
          title="Student Activity"
          text="Use the student activity tab to review project participation by student."
        />
      </div> */}
    </section>
  );
}

function DashboardCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

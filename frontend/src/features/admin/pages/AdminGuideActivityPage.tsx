import { useAdminOverview } from "../hooks/useAdminOverview";
import { AnimatedCard } from "../../../Components/ui/AnimatedCard";
import { motion } from "framer-motion";

export default function AdminGuideActivityPage() {
  const { data, isLoading, isError } = useAdminOverview();

  if (isLoading) {
    return <div className="py-16 text-center text-slate-500">Loading guide activity...</div>;
  }

  if (isError || !data) {
    return <div className="py-16 text-center text-red-600">Unable to load guide activity.</div>;
  }

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 sm:space-y-8"
    >
      <div>
        <h1 className="text-3xl font-semibold bg-gradient-to-r from-slate-900 to-slate-500 bg-clip-text text-transparent dark:from-white dark:to-slate-400">
          Guide Activity Overview
        </h1>
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

      <div className="grid gap-6 lg:grid-cols-2">
        {data.guideActivity.map((guide, i) => (
          <AnimatedCard
            key={guide.id}
            delay={i * 0.05}
            className="group"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white transition-colors group-hover:text-sky-500">
                  {guide.fullName}
                </h2>
                <p className="mt-1 text-sm text-slate-500">{guide.departmentName}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium shadow-sm backdrop-blur-md ${
                  guide.isActive
                    ? "bg-emerald-100/50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-red-100/50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
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
          </AnimatedCard>
        ))}
      </div>
    </motion.section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <AnimatedCard className="flex flex-col justify-center items-center text-center">
      <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="mt-2 text-4xl font-bold bg-gradient-to-br from-slate-800 to-slate-500 bg-clip-text text-transparent dark:from-white dark:to-slate-400">{value}</p>
    </AnimatedCard>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200/50 bg-slate-50/50 p-4 backdrop-blur-sm transition-colors hover:bg-slate-100/50 dark:border-slate-700/50 dark:bg-slate-800/30 dark:hover:bg-slate-800/50">
      <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

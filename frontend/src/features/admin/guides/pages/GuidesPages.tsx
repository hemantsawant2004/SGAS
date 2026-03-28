import {
  useDeleteGuide,
  useGuides,
  useReactivateGuide,
  useUpdateAllGuidesMaxProjects,
  useUpdateGuideMaxProjects,
} from "../hooks/useGuides";
import { useState } from "react";
import { useAppSelector } from "../../../../app/hooks";

function GuidesPage() {
  const { data: guides = [], isLoading, isError } = useGuides();
  const [search, setSearch] = useState("");
  const [bulkLimit, setBulkLimit] = useState("");
  const [guideLimits, setGuideLimits] = useState<Record<number, string>>({});
  const user = useAppSelector((s) => s.auth.user);

  const { mutate: deactivateMutate } = useDeleteGuide();
  const { mutate: reactivateMutate } = useReactivateGuide();
  const { mutate: setGuideLimit } = useUpdateGuideMaxProjects();
  const { mutate: setAllGuideLimits } = useUpdateAllGuidesMaxProjects();

  const isAdmin = user?.role === "admin";

  const activeGuidesCount = guides.filter((g: any) => g.isActive === true).length;
  const inactiveGuidesCount = guides.filter((g: any) => g.isActive === false).length;

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-slate-500 font-medium">Loading guide directory...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-96 items-center justify-center text-red-500 font-medium">
        Error fetching guides. Please try again later.
      </div>
    );
  }

  const filteredGuides = guides.filter((guide: any) =>
    (guide.fullName ?? guide.fullname ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 py-6">
      {/* Top Header & Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        {/* <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Guides Directory
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Manage faculty workload and project allocations.</p>
        </div> */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pl-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 md:w-80"
          />
          <svg className="absolute left-3 top-3 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total Guides", value: guides.length, color: "text-slate-900" },
          { label: "Active", value: activeGuidesCount, color: "text-slate-900" },
          { label: "Inactive", value: inactiveGuidesCount, color: "text-slate-900" },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
            <p className={`mt-2 text-3xl font-black ${stat.color} dark:text-white`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Bulk Action Bar */}
      {isAdmin && (
        <div className="flex flex-col gap-4 rounded-2xl border border-2px p-4 text-black shadow-lg shadow-indigo-200 dark:text-white dark:shadow-none sm:p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-bold">You can Assign Max Limit to all guides</h3>
            {/* <p className="text-sm text-indigo-100">Update project limits for all active guides instantly.</p> */}
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
            <input
              type="number"
              placeholder="Max"
              value={bulkLimit}
              onChange={(e) => setBulkLimit(e.target.value)}
              className="w-full rounded-lg border bg-white/20 px-3 py-2 text-black placeholder:text-indigo-200 focus:ring-2 focus:ring-white sm:w-20"
            />
            <button
              onClick={() => setAllGuideLimits(Number(bulkLimit))}
              className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-indigo-50"
            >
              Apply to All
            </button>
          </div>
        </div>
      )}

      {/* Modern Table Layout */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-[860px] w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/50">
                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Guide</th>
                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Experience</th>
                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Department & Expertise</th>
                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Limit</th>
                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Status</th>
                {isAdmin && <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredGuides.map((guide: any) => (
                <tr key={guide.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  {/* Guide Info */}
                  <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{guide.fullName ?? guide.fullname}</p>
                      </div>
           
                  </td>

                  {/* experience */}
                  <td className="px-6 py-4">
                      <div>
                        <p className="text-xs text-slate-800 dark:text-white">{guide.experience} years exp.</p>
                      </div>
                  </td>

                  {/* Dept & Skills */}
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {/* <span className="text-[10px] font-bold uppercase tracking-tight text-indigo-600 dark:text-indigo-400">
                        {guide.departmentName}
                      </span> */}
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(guide.expertise) ? guide.expertise : (guide.expertise || "").split(",")).slice(0, 3).map((skill: string, i: number) => (
                          <span key={i} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>

                  {/* Max Projects Input */}
                  <td className="px-6 py-4">
                    {isAdmin ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          className="w-14 rounded-md border border-slate-200 p-1 text-center text-xs dark:border-slate-700 dark:bg-slate-800"
                          value={guideLimits[guide.id] ?? guide.maxProjects ?? ""}
                          onChange={(e) => setGuideLimits(prev => ({ ...prev, [guide.id]: e.target.value }))}
                        />
                        <button
                          onClick={() => setGuideLimit({ id: guide.id, maxProjects: Number(guideLimits[guide.id] ?? guide.maxProjects) })}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <span className="font-semibold">{guide.maxProjects}</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${guide.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${guide.isActive ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                      {guide.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Admin Actions */}
                  {isAdmin && (
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => guide.isActive ? deactivateMutate(guide.id) : reactivateMutate(guide.id)}
                        className={`text-xs font-bold uppercase tracking-widest hover:underline ${guide.isActive ? "text-red-500" : "text-emerald-600"
                          }`}
                      >
                        {guide.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default GuidesPage;

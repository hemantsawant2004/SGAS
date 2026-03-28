import { useMemo, useState } from "react";
import { useAdminOverview } from "../hooks/useAdminOverview";

export default function AdminStudentActivityPage() {
  const { data, isLoading, isError } = useAdminOverview();
  const [search, setSearch] = useState("");

  const filteredStudents = useMemo(() => {
    const students = data?.studentActivity ?? [];
    return students.filter((student) =>
      `${student.fullName} ${student.username} ${student.class} ${student.division} ${student.rollNumber}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [data?.studentActivity, search]);

  if (isLoading) {
    return (
      <div className="flex min-h-[260px] items-center justify-center rounded-3xl border border-slate-200 bg-white text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        Loading student activity...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[260px] items-center justify-center rounded-3xl border border-red-200 bg-red-50 text-red-600 shadow-sm dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
        Unable to load student activity.
      </div>
    );
  }

  return (
    <section className="w-full space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Student Activity
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            View student participation and project activity.
          </p>
        </div>

        <div className="w-full lg:max-w-sm">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search student"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Students with projects" value={data.summary.totalStudentActivities} />
        <StatCard label="Total students" value={data.studentActivity.length} />
        <StatCard
          label="Total student project links"
          value={data.studentActivity.reduce((sum, student) => sum + student.projectCount, 0)}
        />
      </div>

      {/* Mobile cards */}
      <div className="grid gap-4 lg:hidden">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <div
              key={student.id}
              className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-slate-900 dark:text-white">
                    {student.fullName || student.username}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Roll No: {student.rollNumber || "-"}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    student.isAssigned
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {student.isAssigned ? "Active in project" : "No project"}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <DetailItem label="Class" value={student.class || "-"} />
                <DetailItem label="Division" value={student.division || "-"} />
                <DetailItem label="Projects" value={String(student.projectCount ?? 0)} />
                <DetailItem label="Username" value={student.username || "-"} />
              </div>
            </div>
          ))
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="w-full overflow-x-auto">
          <table className="w-full table-fixed divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950">
              <tr>
                <th className="w-[28%] px-5 py-4 text-left font-medium text-slate-500">Student</th>
                <th className="w-[14%] px-5 py-4 text-left font-medium text-slate-500">Class</th>
                <th className="w-[14%] px-5 py-4 text-left font-medium text-slate-500">Division</th>
                <th className="w-[18%] px-5 py-4 text-left font-medium text-slate-500">Roll Number</th>
                <th className="w-[26%] px-5 py-4 text-left font-medium text-slate-500">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                    <td className="px-5 py-4">
                      <p className="truncate font-medium text-slate-800 dark:text-white">
                        {student.fullName || student.username}
                      </p>
                      {student.username ? (
                        <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                          {student.username}
                        </p>
                      ) : null}
                    </td>

                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {student.class || "-"}
                    </td>

                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {student.division || "-"}
                    </td>

                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {student.rollNumber || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          student.isAssigned
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {student.isAssigned ? "Active in project" : "No project"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-12">
                    <EmptyState />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-950/50">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center">
      <p className="text-base font-semibold text-slate-900 dark:text-white">
        No students found
      </p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Try searching with another name, class, division, or roll number.
      </p>
    </div>
  );
}
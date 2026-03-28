import { useMemo, useState } from "react";
import { useAdminOverview } from "../hooks/useAdminOverview";

export default function AdminStudentActivityPage() {
  const { data, isLoading, isError } = useAdminOverview();
  const [search, setSearch] = useState("");

  const filteredStudents = useMemo(() => {
    const students = data?.studentActivity ?? [];
    return students.filter((student) =>
      `${student.fullName} ${student.username} ${student.class} ${student.division}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [data?.studentActivity, search]);

  if (isLoading) {
    return <div className="py-16 text-center text-slate-500">Loading student activity...</div>;
  }

  if (isError || !data) {
    return <div className="py-16 text-center text-red-600">Unable to load student activity.</div>;
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          {/* <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Admin</p> */}
          {/* <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
            Student activity
          </h1> */}
        </div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search student"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 md:max-w-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Students with projects" value={data.summary.totalStudentActivities} />
        <StatCard label="Total students" value={data.studentActivity.length} />
        <StatCard
          label="Total student project links"
          value={data.studentActivity.reduce((sum, student) => sum + student.projectCount, 0)}
        />
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-950">
            <tr>
              <th className="px-5 py-4 text-left font-medium text-slate-500">Student</th>
              <th className="px-5 py-4 text-left font-medium text-slate-500">Class</th>
              <th className="px-5 py-4 text-left font-medium text-slate-500">Division</th>
              <th className="px-5 py-4 text-left font-medium text-slate-500">Roll Number</th>
              {/* <th className="px-5 py-4 text-left font-medium text-slate-500">Projects</th> */}
              <th className="px-5 py-4 text-left font-medium text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredStudents.map((student) => (
              <tr key={student.id}>
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-800 dark:text-white">
                    {student.fullName || student.username}
                  </p>
                  {/* <p className="text-xs text-slate-500">{student.username}</p> */}
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

                {/* <td className="px-5 py-4 text-slate-700 dark:text-slate-200">
                  {student.projectCount}
                </td> */}

                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${student.isAssigned
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-700"
                      }`}
                  >
                    {student.isAssigned ? "Active in project" : "No project"}
                  </span>
                </td>

              </tr>
            ))}
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

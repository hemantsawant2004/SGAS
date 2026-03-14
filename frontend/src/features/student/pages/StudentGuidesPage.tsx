import { useMemo, useState } from "react";
import { useStudentGuides } from "../hooks/useStudentGuides";

export default function StudentGuidesPage() {
  const { data: guides = [], isLoading, isError } = useStudentGuides();
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      guides.filter((guide) => {
        const guideName = guide.fullName ?? guide.fullname ?? "";
        const department = guide.departmentName ?? "";
        return `${guideName} ${department}`
          .toLowerCase()
          .includes(search.toLowerCase());
      }),
    [guides, search]
  );

  if (isLoading) {
    return <div className="py-16 text-center text-slate-500">Loading guides...</div>;
  }

  if (isError) {
    return <div className="py-16 text-center text-red-600">Unable to load guides.</div>;
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Student</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
            Browse available guides
          </h1>
        </div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by guide or department"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 md:max-w-xs dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {filtered.map((guide) => {
          const guideName = guide.fullName ?? guide.fullname ?? "Unnamed guide";
          const expertise = Array.isArray(guide.expertise)
            ? guide.expertise
            : typeof guide.expertise === "string"
              ? guide.expertise.split(",")
              : [];

          return (
            <article
              key={guide.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {guideName}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {guide.departmentName || "Department not set"}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                  Active
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {guide.bio || "No bio available."}
              </p>

              <div className="mt-5 grid gap-4 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Experience</p>
                  <p className="mt-1 font-medium text-slate-800 dark:text-white">
                    {guide.experience ?? 0} years
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Qualification</p>
                  <p className="mt-1 font-medium text-slate-800 dark:text-white">
                    {guide.qualification || "-"}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {expertise.map((skill, index) => (
                  <span
                    key={`${guide.id}-${index}`}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

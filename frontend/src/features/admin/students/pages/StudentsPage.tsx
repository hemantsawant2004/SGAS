import { useEffect, useMemo, useState } from "react";
import { useDeleteStudent, useStudents, useUpdateStudent } from "../hooks/useStudents";
import { FaTrashAlt } from "react-icons/fa";

const PAGE_SIZE = 5;

export default function StudentsPage() {
  const { data: students = [], isLoading, isError } = useStudents();
  const { mutate: updateStudent, isPending: isUpdating } = useUpdateStudent();
  const { mutate: deleteStudent, isPending: isDeleting } = useDeleteStudent();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [username, setUsername] = useState("");
  const [givenName] = useState("");

  const filteredStudents = useMemo(
    () =>
      students.filter((student) =>
        student.username.toLowerCase().includes(search.toLowerCase())
      ),
    [search, students]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  if (isLoading) {
    return <div className="py-16 text-center text-slate-500">Loading students...</div>;
  }

  if (isError) {
    return <div className="py-16 text-center text-red-600">Unable to load students.</div>;
  }

  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          {/* <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Admin</p> */}
          {/* <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
            Manage students
          </h1> */}
        </div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by username"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-0 transition focus:border-amber-400 md:max-w-xs dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total students" value={students.length}/>
        {/* <StatCard label="Visible results" value={filteredStudents.length} />
        <StatCard label="Editable records" value={students.length} /> */}
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:hidden">
          Swipe horizontally to view the student table.
        </div>
        <div className="overflow-x-auto overscroll-x-contain">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-950">
            <tr>
              {/* <th className="px-5 py-4 text-left font-medium text-slate-500">ID</th> */}
              <th className="px-5 py-4 text-left font-medium text-slate-500">Username</th>
          
              <th className="px-5 py-4 text-left font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {paginatedStudents.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  className="px-5 py-12 text-center text-slate-500 dark:text-slate-400"
                >
                  No students match the current search.
                </td>
              </tr>
            ) : (
              paginatedStudents.map((student) => {
                const isEditing = editingId === student.id;

                return (
                  <tr key={student.id}>
                    {/* <td className="px-5 py-4 text-slate-500">{student.id}</td> */}
                    <td className="px-5 py-4">
                      {isEditing ? (
                        <input
                          value={username}
                          onChange={(event) => setUsername(event.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
                        />
                      ) : (
                        <span className="font-medium text-slate-800 dark:text-white">
                          {student.username}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => {
                                updateStudent({
                                  id: student.id,
                                  payload: { username, given_name: givenName || null },
                                });
                                setEditingId(null);
                              }}
                              className="rounded-xl bg-emerald-600 px-3 py-2 font-medium text-white"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              disabled={isDeleting}
                              onClick={() => deleteStudent(student.id)}
                              className="rounded-xl px-3 py-2 font-medium text-red-600 hover:text-red-800"
                            >
                              <FaTrashAlt />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
        <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}



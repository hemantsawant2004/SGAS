import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useProjectGuides,
  useSelectableStudents,
  useSubmitProject,
} from "../../projects/hooks/useProjects";

export default function StudentProjectSubmissionPage() {
  const navigate = useNavigate();
  const { data: guides = [], isLoading: guidesLoading } = useProjectGuides();
  const { data: students = [], isLoading: studentsLoading } = useSelectableStudents();
  const { mutate: submitProject, isPending, error } = useSubmitProject();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [technology, setTechnology] = useState("");
  const [preferredGuideId, setPreferredGuideId] = useState("");
  const [projectMembers, setProjectMembers] = useState<number[]>([]);

  const isLoading = guidesLoading || studentsLoading;

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Student</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
          Submit a project
        </h1>
      </div>

      <form
        className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]"
        onSubmit={(event) => {
          event.preventDefault();
          submitProject(
            {
              title,
              description,
              technology,
              preferredGuideId: Number(preferredGuideId),
              projectMembers,
            },
            {
              onSuccess: () => navigate("/student/projects"),
            }
          );
        }}
      >
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Field label="Project title">
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950"
            />
          </Field>

          <Field label="Description">
            <textarea
              required
              minLength={10}
              rows={6}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950"
            />
          </Field>

          <Field label="Technology stack">
            <input
              required
              value={technology}
              onChange={(event) => setTechnology(event.target.value)}
              placeholder="Example: React, Node.js, MySQL"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950"
            />
          </Field>
        </div>

        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Field label="Preferred guide">
            <select
              required
              disabled={isLoading}
              value={preferredGuideId}
              onChange={(event) => setPreferredGuideId(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="">Select guide</option>
              {guides.map((guide) => (
                <option key={guide.id} value={guide.id}>
                  {guide.fullName ?? guide.fullname ?? `Guide ${guide.id}`}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Project members">
            <div className="max-h-72 space-y-3 overflow-y-auto rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
              {students.map((student) => (
                <label
                  key={student.id}
                  className="flex items-start justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-950"
                >
                  <span className="min-w-0 break-words">{student.username}</span>
                  <input
                    type="checkbox"
                    checked={projectMembers.includes(student.id)}
                    onChange={(event) => {
                      setProjectMembers((current) =>
                        event.target.checked
                          ? [...current, student.id]
                          : current.filter((id) => id !== student.id)
                      );
                    }}
                  />
                </label>
              ))}
            </div>
          </Field>

          {error ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {(error as any)?.response?.data?.message || "Project submission failed."}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isPending || isLoading}
            className="w-full rounded-2xl bg-amber-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Submitting..." : "Submit project"}
          </button>
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
      {children}
    </label>
  );
}

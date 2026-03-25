import { useState, type ReactNode } from "react";
import {
  useProjectGuides,
  useSelectableStudents,
  useSubmitProject,
} from "../projects/hooks/useProjects";
import type { Project } from "../projects/services/projects.service";

export default function StudentProjectSubmissionCelebrationPage() {
  const { data: guides = [], isLoading: guidesLoading } = useProjectGuides();
  const { data: students = [], isLoading: studentsLoading } = useSelectableStudents();
  const { mutate: submitProject, isPending, error } = useSubmitProject();
  const [submittedProject, setSubmittedProject] = useState<Project | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [technology, setTechnology] = useState("");
  const [preferredGuideId, setPreferredGuideId] = useState("");
  const [projectMembers, setProjectMembers] = useState<number[]>([]);

  const isLoading = guidesLoading || studentsLoading;

  if (submittedProject) {
    const allocationIssue = (submittedProject as any).allocationIssue as
      | { message?: string }
      | null
      | undefined;
    const projectCode = submittedProject.projectCode?.trim() || "Code pending";
    const assignedGuideName =
      submittedProject.assignedGuide?.fullName ??
      submittedProject.assignedGuide?.fullname ??
      "Guide allocation pending";

    return (
      <section className="relative overflow-hidden rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-8 shadow-sm dark:border-emerald-900 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-10 top-10 h-4 w-4 rounded-full bg-amber-300 animate-bounce" />
          <div className="absolute right-16 top-20 h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
          <div className="absolute left-1/4 top-28 h-2 w-2 rounded-full bg-sky-400 animate-ping" />
          <div className="absolute bottom-16 left-12 h-3 w-3 rounded-full bg-rose-300 animate-pulse" />
          <div className="absolute bottom-24 right-24 h-4 w-4 rounded-full bg-violet-300 animate-bounce" />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-4xl text-white shadow-lg shadow-emerald-500/30">
            ✓
          </div>
          <p className="mt-6 text-sm uppercase tracking-[0.35em] text-emerald-600 dark:text-emerald-400">
            Project Submitted
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-900 dark:text-white">
            Submission successful
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
            Your project <span className="font-semibold text-slate-900 dark:text-white">{submittedProject.title}</span> has been submitted successfully.
            Your tracking code is - <br/>{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              {projectCode}
            </span>.
            The currently assigned guide is{" "}
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              {assignedGuideName}
            </span>.
          </p>

          {allocationIssue?.message ? (
            <div className="mx-auto mt-6 max-w-2xl rounded-3xl border border-amber-300 bg-amber-50 px-5 py-4 text-left text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
              {allocationIssue.message}
            </div>
          ) : null}

          <div className="mt-8 grid gap-4 text-left md:grid-cols-3">
            <SummaryCard label="Project" value={submittedProject.title} />
            {/* <SummaryCard label="Project Code" value={projectCode} /> */}
            <SummaryCard label="Technology" value={submittedProject.technology} />
            <SummaryCard label="Assigned Guide" value={assignedGuideName} />
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            
            <button
              type="button"
              onClick={() => (window.location.href = "/student/projects")}
              className="rounded-2xl bg-emerald-500 px-5 py-3 font-medium text-white transition hover:bg-emerald-400"
            >
              View my project
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Student</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
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
              onSuccess: (project) => {
                setSubmittedProject(project);
              },
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
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-950"
                >
                  <span>{student.username}</span>
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
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
      {children}
    </label>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

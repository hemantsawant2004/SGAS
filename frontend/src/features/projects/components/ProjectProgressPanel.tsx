import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { api } from "../../../app/config/axios.config";
import {
  PROJECT_PHASES,
  type Project,
  type ProjectPhaseName,
  type ProjectProgress,
} from "../services/projects.service";
import {
  useCreateProjectProgress,
  useDeleteProjectProgress,
  useProjectProgress,
  useReviewProjectProgress,
} from "../hooks/useProjects";

type Mode = "student" | "guide" | "viewer";

const phaseLabelMap: Record<ProjectPhaseName, string> = {
  intro: "Introduction to project and proposed system",
  "system analysis": "System Analysis",
  "system design": "System Design",
  reports: "Reports, Conclusion and conclusion",
  "rough documentation": "Rough Documentation",
  "final submission": "Final Submission",
};

const phaseDotColorMap = {
  pending: "border-slate-500 bg-slate-700",
  in_progress: "border-amber-400 bg-amber-400",
  completed: "border-emerald-400 bg-emerald-400",
} as const;

const remarkStatusColorMap = {
  pending:
    "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300",
  needs_changes:
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-300",
  completed:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300",
} as const;

const getAttachmentUrl = (progress: ProjectProgress) => {
  if (!progress.fileUrl) return null;

  const baseUrl =
    typeof api.defaults.baseURL === "string"
      ? api.defaults.baseURL
      : window.location.origin;
  const apiRoot = baseUrl.replace(/\/api\/?$/, "");

  return progress.fileUrl.startsWith("http")
    ? progress.fileUrl
    : `${apiRoot}${progress.fileUrl.startsWith("/") ? progress.fileUrl : `/${progress.fileUrl}`
    }`;
};

const readFileAsBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      resolve(result.includes(",") ? result.split(",").pop() ?? "" : result);
    };
    reader.onerror = () => reject(new Error("Unable to read file."));
    reader.readAsDataURL(file);
  });

const formatDateTime = (value?: string | null) => {
  if (!value) return "Just now";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatFileSize = (bytes?: number | null) => {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const truncateText = (value?: string | null, maxLength = 120) => {
  if (!value) return "";
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trimEnd()}...`;
};

export default function ProjectProgressPanel({
  project,
  mode,
  initialProgressUpdates,
}: {
  project: Project;
  mode: Mode;
  initialProgressUpdates?: ProjectProgress[];
}) {
  const shouldFetchProgress = mode !== "viewer";
  const { data: fetchedProgressUpdates = [], isLoading } = useProjectProgress(
    project.id,
    shouldFetchProgress
  );
  const { mutate: sendProgress, isPending: isSending } =
    useCreateProjectProgress(project.id);
  const { mutate: deleteProgress, isPending: isDeleting } =
    useDeleteProjectProgress(project.id);
  const { mutate: reviewProgress, isPending: isReviewing } =
    useReviewProjectProgress(project.id);

  const [expandedProgressId, setExpandedProgressId] = useState<number | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<ProjectPhaseName>("intro");
  const [progressText, setProgressText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [remarkDrafts, setRemarkDrafts] = useState<
    Record<number, "needs_changes" | "completed">
  >({});

  const progressUpdates = shouldFetchProgress
    ? fetchedProgressUpdates
    : initialProgressUpdates ?? [];
  const progressLoading = shouldFetchProgress ? isLoading : false;

  const phaseStatuses =
    project.phaseStatuses ??
    PROJECT_PHASES.map((phase) => ({ phase, status: "pending" as const }));

  const orderedPhaseStatuses = PROJECT_PHASES.map((phase) => {
    const matchedPhase = phaseStatuses.find((entry) => entry.phase === phase);
    return matchedPhase ?? { phase, status: "pending" as const };
  });

  const availableStudentPhases = useMemo(
    () =>
      phaseStatuses
        .filter((entry) => entry.status !== "completed")
        .map((entry) => entry.phase),
    [phaseStatuses]
  );

  const isAssignedGuideInactive =
    mode === "student" &&
    Boolean(
      project.assignedGuide?.id ||
      project.assignedGuide?.fullName ||
      project.assignedGuide?.fullname
    ) &&
    project.assignedGuide?.isActive === false;

  const canStudentSubmit =
    mode === "student" &&
    Boolean(
      project.assignedGuide?.id ||
      project.assignedGuide?.fullName ||
      project.assignedGuide?.fullname
    ) &&
    !isAssignedGuideInactive;

  const selectedPhaseNeedsChangesProgress =
    mode === "student"
      ? progressUpdates.find(
        (progress) =>
          progress.phase === selectedPhase &&
          progress.remarkStatus === "needs_changes"
      ) ?? null
      : null;

  useEffect(() => {
    if (!availableStudentPhases.length) return;
    if (!availableStudentPhases.includes(selectedPhase)) {
      setSelectedPhase(availableStudentPhases[0]);
    }
  }, [availableStudentPhases, selectedPhase]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setSelectedFile(null);
      setFileError(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSelectedFile(null);
      setFileError("File size must be 5MB or less.");
      return;
    }

    setSelectedFile(file);
    setFileError(null);
  };

  const handleSendProgress = async () => {
    if (!progressText.trim() && !selectedFile) {
      setFileError("Add a caption, a file, or both.");
      return;
    }

    const payload: {
      phase: ProjectPhaseName;
      progressText?: string;
      fileBase64?: string;
      fileName?: string;
      fileMimeType?: string;
    } = {
      phase: selectedPhase,
      progressText: progressText.trim(),
    };

    if (selectedFile) {
      payload.fileBase64 = await readFileAsBase64(selectedFile);
      payload.fileName = selectedFile.name;
      payload.fileMimeType = selectedFile.type || "application/octet-stream";
    }

    sendProgress(payload, {
      onSuccess: () => {
        setProgressText("");
        setSelectedFile(null);
        setFileError(null);
        const input = document.getElementById(
          `progress-file-${project.id}`
        ) as HTMLInputElement | null;
        if (input) input.value = "";
      },
      onError: (error: any) => {
        setFileError(error?.response?.data?.message || "Failed to send progress.");
      },
    });
  };

  return (
    <section className="space-y-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 dark:border-slate-800">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Project Phases
        </p>
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Progress Tracker
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Track each project phase, submit updates, and review guide feedback.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
        <div className="overflow-x-auto">
          <div className="flex min-w-[860px] items-start">
            {orderedPhaseStatuses.map((entry, index) => (
              <div key={entry.phase} className="flex flex-1 items-center">
                <div className="flex w-full flex-col items-center text-center">
                  <span
                    title={`${phaseLabelMap[entry.phase]}: ${entry.status.replace(
                      "_",
                      " "
                    )}`}
                    className={`h-4 w-4 rounded-full border-2 ${phaseDotColorMap[entry.status]
                      }`}
                  />
                  <span className="mt-3 max-w-[140px] text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">
                    {phaseLabelMap[entry.phase]}
                  </span>
                </div>

                {index !== orderedPhaseStatuses.length - 1 ? (
                  <div className="mx-3 h-px flex-1 bg-slate-300 dark:bg-slate-700" />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      {mode === "student" ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 dark:border-slate-800">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              {selectedPhaseNeedsChangesProgress ? "Update Progress" : "Submit Progress"}
            </h3>
            <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
              {selectedPhaseNeedsChangesProgress
                ? "This phase needs changes. Update the existing submission and resend it to your guide."
                : "Choose the current phase, write a short caption, and attach the latest report draft if needed."}
            </p>
          </div>

          {!canStudentSubmit ? (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm leading-6 text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              {isAssignedGuideInactive
                ? "Your assigned guide is inactive right now. Progress submission is disabled until admin reactivates or reassigns a guide."
                : "Progress can be sent after a guide is allocated to this project."}
            </div>
          ) : !availableStudentPhases.length ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300">
              All project phases are already completed. No further progress can be sent.
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Select Phase
                </p>

                <div className="grid grid-cols-3 gap-3 ">
                  {PROJECT_PHASES.map((phase) => {
                    const isCompleted = !availableStudentPhases.includes(phase);
                    const isSelected = selectedPhase === phase;

                    return (
                      <button
                        key={phase}
                        type="button"
                        disabled={isCompleted}
                        onClick={() => setSelectedPhase(phase)}
                        className={`flex min-h-[72px] w-full items-start justify-between gap-3 rounded-2xl border px-4 py-4 text-left text-sm transition ${isCompleted
                            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500"
                            : isSelected
                              ? "border-slate-900 bg-slate-900 text-white shadow-sm dark:border-white dark:bg-white dark:text-slate-900"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-800"
                          }`}
                      >
                        <span className="pr-2 leading-5">{phaseLabelMap[phase]}</span>
                        <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em]">
                          {isCompleted ? "Done" : "Open"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                      Caption
                    </label>
                    <textarea
                      value={progressText}
                      onChange={(event) => setProgressText(event.target.value)}
                      rows={5}
                      placeholder="Example: Added literature review summary, corrected formatting, and attached the updated report draft for review."
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-slate-800"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`progress-file-${project.id}`}
                      className="block text-sm font-semibold text-slate-900 dark:text-white"
                    >
                      Attachment
                    </label>

                    <div className="mt-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/50">
                      <input
                        id={`progress-file-${project.id}`}
                        type="file"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-700 dark:text-slate-300 dark:file:bg-white dark:file:text-slate-900"
                      />

                      <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        Upload PDF, DOC, DOCX, image, or any report-supporting file.
                      </p>

                      {selectedFile ? (
                        <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                          {selectedFile.name}
                        </div>
                      ) : null}

                      {fileError ? (
                        <p className="mt-3 text-sm font-medium text-red-600">{fileError}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 border-t border-slate-200 pt-5 md:flex-row md:items-center md:justify-between dark:border-slate-800">
                    {/* <p className="text-sm text-slate-500 dark:text-slate-400">
                      Selected phase:{" "}
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {phaseLabelMap[selectedPhase]}
                      </span>
                    </p> */}

                    <button
                      type="button"
                      disabled={
                        isSending ||
                        !availableStudentPhases.length ||
                        (!progressText.trim() && !selectedFile)
                      }
                      onClick={() => {
                        void handleSendProgress();
                      }}
                      className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                    >
                      {isSending
                        ? selectedPhaseNeedsChangesProgress
                          ? "Updating..."
                          : "Submitting..."
                        : selectedPhaseNeedsChangesProgress
                          ? "Update & Resend"
                          : "Submit Progress"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}

      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
            Progress History
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Log of submitted updates and guide feedback.
          </p>
        </div>

        {progressLoading ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            Loading progress updates...
          </div>
        ) : progressUpdates.length ? (
          <div className="space-y-4">
            {progressUpdates.map((progress) => {
              const attachmentUrl = getAttachmentUrl(progress);
              const fileSize = formatFileSize(progress.fileSize);
              const isExpanded = expandedProgressId === progress.id;
              const summaryText = truncateText(
                progress.progressText || progress.guideReply,
                110
              );

              return (
                <article
                  key={progress.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex flex-col gap-4 px-5 py-5 sm:px-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${phaseDotColorMap[
                              progress.remarkStatus === "completed"
                                ? "completed"
                                : progress.remarkStatus === "pending"
                                  ? "pending"
                                  : "in_progress"
                              ]
                              }`}
                          />
                          <p className="text-base font-semibold text-slate-900 dark:text-white">
                            {phaseLabelMap[progress.phase]}
                          </p>
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${remarkStatusColorMap[progress.remarkStatus]
                              }`}
                          >
                            {progress.remarkStatus.replace("_", " ")}
                          </span>
                          {attachmentUrl && progress.fileName ? (
                            <span className="inline-flex rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400">
                              Attachment
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          Submitted by{" "}
                          {progress.student?.given_name ||
                            progress.student?.username ||
                            "Student"}{" "}
                          on {formatDateTime(progress.updatedAt ?? progress.createdAt)}
                        </p>

                        {summaryText ? (
                          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                            {summaryText}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                        {mode === "student" && progress.remarkStatus === "pending" ? (
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => {
                              if (window.confirm("Delete this pending progress submission?")) {
                                deleteProgress(progress.id);
                              }
                            }}
                            className="inline-flex rounded-full border border-rose-200 px-3.5 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-900/70 dark:text-rose-300 dark:hover:bg-rose-950/30"
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </button>
                        ) : null}

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedProgressId((current) =>
                              current === progress.id ? null : progress.id
                            )
                          }
                          className="inline-flex rounded-full border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          {isExpanded ? "Hide details" : "View details"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {isExpanded ? (
                    <div className="border-t border-slate-200 bg-slate-50 px-5 py-5 sm:px-6 dark:border-slate-800 dark:bg-slate-950/40">
                      <div className="space-y-5">
                        {progress.progressText ? (
                          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                              Caption
                            </p>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300">
                              {progress.progressText}
                            </p>
                          </div>
                        ) : null}

                        {attachmentUrl && progress.fileName ? (
                          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                Attachment
                              </p>
                              <a
                                href={attachmentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 block break-all text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
                              >
                                {progress.fileName}
                              </a>
                              {fileSize ? (
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                  {fileSize}
                                </p>
                              ) : null}
                            </div>

                            <a
                              href={attachmentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                              Open File
                            </a>
                          </div>
                        ) : null}

                        {progress.guideReply ? (
                          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                Guide Feedback
                              </p>
                              <p className="text-xs text-slate-400">
                                {formatDateTime(progress.reviewedAt)}
                              </p>
                            </div>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300">
                              {progress.guideReply}
                            </p>
                          </div>
                        ) : null}

                        {mode === "guide" ? (
                          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                              Review Submission
                            </p>

                            <div className="mt-4 grid gap-3 xl:grid-cols-[1fr_190px_auto]">
                              <textarea
                                value={replyDrafts[progress.id] ?? progress.guideReply ?? ""}
                                onChange={(event) =>
                                  setReplyDrafts((current) => ({
                                    ...current,
                                    [progress.id]: event.target.value,
                                  }))
                                }
                                rows={4}
                                placeholder="Reply with remarks for this progress."
                                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-slate-800"
                              />

                              <select
                                value={
                                  remarkDrafts[progress.id] ??
                                  (progress.remarkStatus === "completed"
                                    ? "completed"
                                    : "needs_changes")
                                }
                                onChange={(event) =>
                                  setRemarkDrafts((current) => ({
                                    ...current,
                                    [progress.id]: event.target.value as
                                      | "needs_changes"
                                      | "completed",
                                  }))
                                }
                                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-slate-800"
                              >
                                <option value="needs_changes">Needs changes</option>
                                <option value="completed">Completed</option>
                              </select>

                              <button
                                type="button"
                                disabled={
                                  isReviewing ||
                                  (replyDrafts[progress.id] ??
                                    progress.guideReply ??
                                    ""
                                  ).trim().length < 2
                                }
                                onClick={() =>
                                  reviewProgress({
                                    progressId: progress.id,
                                    payload: {
                                      guideReply: (
                                        replyDrafts[progress.id] ??
                                        progress.guideReply ??
                                        ""
                                      ).trim(),
                                      remarkStatus:
                                        remarkDrafts[progress.id] ??
                                        (progress.remarkStatus === "completed"
                                          ? "completed"
                                          : "needs_changes"),
                                    },
                                  })
                                }
                                className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {isReviewing ? "Saving..." : "Save Review"}
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No progress updates yet.
          </div>
        )}
      </div>
    </section>
  );
}
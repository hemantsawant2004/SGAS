import { Link } from "react-router-dom";
import { useAppSelector } from "../../../app/hooks";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "../hooks/useNotifications";
import { BackButton } from "../../../Components/formcomponents/BackButtonComponent";

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// const notificationTypeLabel: Record<string, string> = {
//   project_assigned: "Project assignment",
//   progress_submitted: "Progress submission",
//   progress_reviewed: "Guide review",
//   project_created: "New project",
//   allocation_review_required: "Allocation review",
//   student_created: "New student",
//   guide_created: "New guide",
// };

export default function NotificationsPage() {
  const user = useAppSelector((state) => state.auth.user);
  const { data, isLoading, isError } = useNotifications();
  const { mutate: markOneRead, isPending: isMarkingOne } = useMarkNotificationRead();
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllNotificationsRead();

  const notifications = data?.notifications ?? [];

  const getProjectLink = (projectId?: number | null) => {
    if (!projectId) return null;
    if (user?.role === "guide") return `/guide/projects/${projectId}/progress`;
    if (user?.role === "student") return `/student/projects/${projectId}/progress`;
    return "/admin/projects";
  };

  if (isLoading) {
    return <div className="py-16 text-center text-slate-500">Loading notifications...</div>;
  }

  if (isError) {
    return <div className="py-16 text-center text-red-600">Unable to load notifications.</div>;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="ml-5 mb-5 flex gap-6">
          <BackButton />
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Notifications</h1>
          {/* <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Recent project updates for your account.
          </p> */}
        </div>
        {/* <div>
      
        </div> */}
        <button
          type="button"
          disabled={isMarkingAll || !data?.unreadCount}
          onClick={() => markAllRead()}
          className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {isMarkingAll ? "Marking..." : "Mark all as read"}
        </button>
      </div>

      {notifications.length ? (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const projectLink = getProjectLink(notification.projectId);

            return (
              <article
                key={notification.id}
                className={`rounded-3xl border p-5 shadow-sm transition ${notification.isRead
                    ? "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                    : "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20"
                  }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* <span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:border-slate-700 dark:text-slate-300">
                        {notificationTypeLabel[notification.type] ?? "Update"}
                      </span> */}
                      {!notification.isRead ? (
                        <span className="rounded-full bg-amber-500 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
                          New
                        </span>
                      ) : null}
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {notification.title}
                    </h2>
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDateTime(notification.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!notification.isRead ? (
                      <button
                        type="button"
                        disabled={isMarkingOne}
                        onClick={() => markOneRead(notification.id)}
                        className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        Mark read
                      </button>
                    ) : null}
                    {projectLink ? (
                      <Link
                        to={projectLink}
                        onClick={() => {
                          if (!notification.isRead) {
                            markOneRead(notification.id);
                          }
                        }}
                        className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                      >
                        Open project
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          No notifications yet.
        </div>
      )}
    </section>
  );
}

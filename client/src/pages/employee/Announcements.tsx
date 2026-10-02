import { useEffect, useState } from "react";
import { Megaphone, RefreshCw, Building2 } from "lucide-react";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { Announcement } from "../../types/index";
import { PRIORITY_CONFIG } from "../../lib/announcementStyles";
import { cn, timeAgo } from "../../lib/utils";

export default function EmployeeAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/announcements")
      .then((res) => setAnnouncements(res.data.data || []))
      .catch(() => toast.error("Failed to load announcements"))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="w-6 h-6 text-violet-500 animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1
          style={{ fontFamily: "var(--font-display)" }}
          className="text-2xl font-bold text-gray-900 dark:text-white"
        >
          Announcements
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Updates from your property owner and manager
        </p>
      </div>

      {announcements.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <Megaphone className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 dark:text-white">
            No announcements yet
          </h3>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => {
            const config = PRIORITY_CONFIG[a.priority];
            const Icon = config.icon;
            return (
              <div
                key={a.id}
                className={cn(
                  "p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 border-l-4",
                  config.border,
                )}
              >
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span
                    className={cn(
                      "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium",
                      config.badge,
                    )}
                  >
                    <Icon className="w-3 h-3" /> {config.label}
                  </span>
                  {!a.buildingId && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> All Buildings
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {a.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-wrap">
                  {a.body}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {a.author?.name} · {timeAgo(a.createdAt)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

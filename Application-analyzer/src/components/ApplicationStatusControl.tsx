import { useState } from "react";
import { toast } from "react-toastify";
import {
  applicationService,
  Application,
  ApplicationStatus,
} from "../api/services";

interface Props {
  application: Pick<Application, "id" | "status" | "allowed_next_statuses">;
  /** Called with the updated application after a successful change. */
  onChanged: (updated: Application) => void;
  /** "compact" = small buttons for table rows, "full" = larger buttons for the detail page. */
  size?: "compact" | "full";
}

// Button label + colour for moving INTO each status.
const ACTIONS: Record<ApplicationStatus, { label: string; reopenLabel?: string; cls: string }> = {
  under_review: {
    label: "Start Review",
    reopenLabel: "Re-open for Review",
    cls: "bg-yellow-500 hover:bg-yellow-600 text-white",
  },
  shortlisted: { label: "Shortlist", cls: "bg-purple-500 hover:bg-purple-600 text-white" },
  accepted: { label: "Accept", cls: "bg-green-500 hover:bg-green-600 text-white" },
  rejected: { label: "Reject", cls: "bg-red-500 hover:bg-red-600 text-white" },
  submitted: { label: "Submitted", cls: "bg-gray-400 text-white" },
};

export default function ApplicationStatusControl({ application, onChanged, size = "full" }: Props) {
  const [busy, setBusy] = useState<ApplicationStatus | null>(null);
  const next = application.allowed_next_statuses ?? [];

  const change = async (status: ApplicationStatus) => {
    if (status === "rejected" && !window.confirm("Reject this application?")) return;
    try {
      setBusy(status);
      const updated = await applicationService.updateApplicationStatus(application.id, status);
      toast.success(`Application moved to ${status.replace("_", " ")}`);
      onChanged(updated);
    } catch (error: any) {
      const data = error.response?.data;
      toast.error(data?.status || data?.detail || "Failed to update status");
    } finally {
      setBusy(null);
    }
  };

  if (next.length === 0) {
    return <span className="text-xs text-gray-400">Final status</span>;
  }

  const pad = size === "compact" ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {next.map((status) => {
        const action = ACTIONS[status];
        const label =
          application.status === "rejected" && action.reopenLabel ? action.reopenLabel : action.label;
        return (
          <button
            key={status}
            disabled={busy !== null}
            onClick={() => change(status)}
            className={`${pad} rounded-lg font-semibold transition disabled:opacity-50 ${action.cls}`}
          >
            {busy === status ? "..." : label}
          </button>
        );
      })}
    </div>
  );
}

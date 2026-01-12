interface StatusBadgeProps {
    status: string;
    customClass?: string;
}

export default function StatusBadge({ status, customClass }: StatusBadgeProps) {
    const getStatusClass = (status: string) => {
        const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_');

        switch (normalizedStatus) {
            case "pending":
            case "submitted":
                return "badge-pending";
            case "under_review":
                return "badge-under-review";
            case "shortlisted":
                return "badge-shortlisted";
            case "interview_scheduled":
            case "interview":
                return "badge-interview";
            case "hired":
                return "badge-hired";
            case "rejected":
                return "badge-rejected";
            default:
                return "badge-blue";
        }
    };

    const formatStatus = (status: string) => {
        return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    };

    return (
        <span className={`${getStatusClass(status)} ${customClass || ''}`}>
            {formatStatus(status)}
        </span>
    );
}

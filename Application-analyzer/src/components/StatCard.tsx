interface StatCardProps {
    count: number | string;
    label: string;
    icon?: string;
    illustration?: React.ReactNode;
    bgColor?: string;
}

export default function StatCard({ count, label, icon, illustration, bgColor = "bg-white" }: StatCardProps) {
    return (
        <div className={`stat-card ${bgColor} relative overflow-hidden`}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="text-4xl font-bold text-gray-800 mb-2">{count}</div>
                    <div className="text-sm text-gray-600 font-medium">{label}</div>
                </div>
                {illustration ? (
                    <div className="ml-4">{illustration}</div>
                ) : icon ? (
                    <div className="ml-4 text-5xl text-gray-300">
                        <i className={icon}></i>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

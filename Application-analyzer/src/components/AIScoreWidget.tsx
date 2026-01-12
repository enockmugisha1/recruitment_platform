

interface AIScoreWidgetProps {
    score: number;
    label: string;
    criteria: {
        name: string;
        matched: boolean;
    }[];
}

export default function AIScoreWidget({ score, label, criteria }: AIScoreWidgetProps) {
    // Calculate the stroke-dasharray for the circular progress bar
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col items-center mb-8">
                <div className="relative w-32 h-32 flex items-center justify-center">
                    {/* Background Circle */}
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="64"
                            cy="64"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-gray-100"
                        />
                        {/* Progress Circle */}
                        <circle
                            cx="64"
                            cy="64"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            className="text-green-500 transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-bold text-gray-800">{score}</span>
                    </div>
                </div>
                <div className="mt-4 text-center">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Score</p>
                    <p className="text-lg font-bold text-green-600">{label}</p>
                    <button className="mt-1 text-xs text-accentprimary hover:underline font-semibold">Edit</button>
                </div>
            </div>

            <ul className="space-y-4">
                {criteria.map((item, index) => (
                    <li key={index} className="flex items-center justify-between group">
                        <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                            {item.name}
                        </span>
                        <div className={`w-5 h-5 flex items-center justify-center rounded-full ${item.matched ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                            {item.matched ? (
                                <i className="fa-solid fa-check text-[10px]"></i>
                            ) : (
                                <i className="fa-solid fa-xmark text-[10px]"></i>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

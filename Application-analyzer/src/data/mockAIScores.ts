// Mock AI scoring data for candidate evaluation
// This data will be used until backend AI integration is complete

export interface AIScore {
    candidateId: number;
    score: number;
    label: string;
    criteria: {
        name: string;
        matched: boolean;
    }[];
}

// Mock scores mapped by candidate/application ID
export const mockAIScores: Record<number, AIScore> = {
    1: {
        candidateId: 1,
        score: 80,
        label: "Potential Fit",
        criteria: [
            { name: "Qualifications and skills match", matched: true },
            { name: "Experience Relevance", matched: true },
            { name: "References", matched: true },
            { name: "Education", matched: true },
            { name: "Keywords Match", matched: false },
            { name: "Years of Experience", matched: false },
            { name: "Job Hopping", matched: false },
            { name: "Cultural Fit", matched: false },
            { name: "Interview Performance", matched: false },
        ],
    },
    2: {
        candidateId: 2,
        score: 33,
        label: "Needs Review",
        criteria: [
            { name: "Qualifications and skills match", matched: true },
            { name: "Experience Relevance", matched: false },
            { name: "References", matched: true },
            { name: "Education", matched: false },
            { name: "Keywords Match", matched: false },
            { name: "Years of Experience", matched: false },
            { name: "Job Hopping", matched: false },
            { name: "Cultural Fit", matched: true },
            { name: "Interview Performance", matched: false },
        ],
    },
    3: {
        candidateId: 3,
        score: 66,
        label: "Good Match",
        criteria: [
            { name: "Qualifications and skills match", matched: true },
            { name: "Experience Relevance", matched: true },
            { name: "References", matched: true },
            { name: "Education", matched: true },
            { name: "Keywords Match", matched: true },
            { name: "Years of Experience", matched: true },
            { name: "Job Hopping", matched: false },
            { name: "Cultural Fit", matched: false },
            { name: "Interview Performance", matched: false },
        ],
    },
    4: {
        candidateId: 4,
        score: 55,
        label: "Good Match",
        criteria: [
            { name: "Qualifications and skills match", matched: true },
            { name: "Experience Relevance", matched: true },
            { name: "References", matched: false },
            { name: "Education", matched: true },
            { name: "Keywords Match", matched: true },
            { name: "Years of Experience", matched: true },
            { name: "Job Hopping", matched: false },
            { name: "Cultural Fit", matched: false },
            { name: "Interview Performance", matched: false },
        ],
    },
    5: {
        candidateId: 5,
        score: 78,
        label: "Potential Fit",
        criteria: [
            { name: "Qualifications and skills match", matched: true },
            { name: "Experience Relevance", matched: true },
            { name: "References", matched: true },
            { name: "Education", matched: true },
            { name: "Keywords Match", matched: true },
            { name: "Years of Experience", matched: false },
            { name: "Job Hopping", matched: true },
            { name: "Cultural Fit", matched: false },
            { name: "Interview Performance", matched: false },
        ],
    },
};

// Helper function to get AI score for a candidate
export const getAIScore = (candidateId: number): AIScore => {
    // Return mock score if available, otherwise return default score
    return mockAIScores[candidateId] || {
        candidateId,
        score: Math.floor(Math.random() * 100),
        label: "Under Analysis",
        criteria: [
            { name: "Qualifications and skills match", matched: false },
            { name: "Experience Relevance", matched: false },
            { name: "References", matched: false },
            { name: "Education", matched: false },
            { name: "Keywords Match", matched: false },
            { name: "Years of Experience", matched: false },
            { name: "Job Hopping", matched: false },
            { name: "Cultural Fit", matched: false },
            { name: "Interview Performance", matched: false },
        ],
    };
};

// Helper function to get score label based on score value
export const getScoreLabel = (score: number): string => {
    if (score >= 80) return "Excellent Fit";
    if (score >= 70) return "Potential Fit";
    if (score >= 50) return "Good Match";
    if (score >= 30) return "Needs Review";
    return "Poor Match";
};

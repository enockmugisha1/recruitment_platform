const FAQS = [
    {
      q: "How do I update my profile information?",
      a: "Go to Settings from the sidebar or the profile menu in the top-right corner, then edit and save your details.",
    },
    {
      q: "How do I reset my password?",
      a: "On the Settings page, click 'Reset Password' — you'll be taken through the forgot-password flow via email verification.",
    },
    {
      q: "How do recruiters review applications?",
      a: "Recruiters can review, score, and update candidate status from the Candidates page.",
    },
    {
      q: "How do job seekers track their applications?",
      a: "Job seekers can see the status of every application they've submitted on the My Applications page.",
    },
  ];
  
  export default function Help() {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Help & Support</h1>
  
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Frequently Asked Questions</h2>
          <div className="divide-y divide-gray-100">
            {FAQS.map((item) => (
              <div key={item.q} className="py-4">
                <p className="font-medium text-gray-800 mb-1">{item.q}</p>
                <p className="text-sm text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
  
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Still need help?</h2>
          <p className="text-sm text-gray-600">
            Reach out to our support team at{" "}
            <a href="mailto:support@thinkgreenafrika.com" className="text-green-600 font-medium hover:underline">
              support@thinkgreenafrika.com
            </a>
          </p>
        </div>
      </div>
    );
  }
  
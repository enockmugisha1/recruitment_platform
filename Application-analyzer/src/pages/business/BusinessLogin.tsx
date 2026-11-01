import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "../../api/axios";
import { apiError } from "../../utils/errors";
import { saveSession } from "../../utils/auth";

/** ThinkGreen Afrika business login (reached at /business/login). */
export default function BusinessLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post("/auth/login/", { email, password });
      if (data.user_data.role !== "business") {
        setError("This isn't a business account. Recruiters and job seekers log in on the main login page.");
        return;
      }
      saveSession(data, false);
      navigate(data.user_data.must_change_password ? "/change-password" : "/business", { replace: true });
    } catch (err) {
      const message = apiError(err, "Login failed");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const input =
    "w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-gray-100 p-4">
      <ToastContainer />
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white">
            <i className="fa-solid fa-leaf text-xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">ThinkGreen Afrika</h1>
          <p className="text-sm font-semibold uppercase tracking-wider text-green-600">Business portal</p>
          <p className="mt-2 text-sm text-gray-500">Register companies and set up their recruiters.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <input className={input} type="email" required placeholder="Business email" autoComplete="username"
            value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={input} type="password" required placeholder="Password" autoComplete="current-password"
            value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}
          <button type="submit" disabled={loading}
            className="w-full rounded-lg bg-green-600 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Recruiter or job seeker?{" "}
          <Link to="/login" className="font-semibold text-green-600 hover:underline">Go to the main login</Link>
        </p>
      </div>
    </div>
  );
}

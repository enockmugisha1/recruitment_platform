import { useState } from "react";
import { RecruiterCredentials } from "../api/services";

interface Props {
  credentials: RecruiterCredentials;
  /** true when this is a password reset rather than a brand-new account */
  reset?: boolean;
  onClose: () => void;
}

/**
 * Shown once after a recruiter is created (or their password is reset).
 * The temporary password is never stored in readable form, so this is the
 * only chance to hand it over if the email doesn't arrive.
 */
export default function CredentialsModal({ credentials, reset = false, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const { recruiter, temporary_password, email_sent } = credentials;
  const loginUrl = `${window.location.origin}/login`;

  const copy = async () => {
    const text = `Login: ${loginUrl}\nEmail: ${recruiter.email}\nTemporary password: ${temporary_password}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the details are on screen to copy by hand */
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
            <i className="fa-solid fa-key"></i>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              {reset ? "Password reset" : "Recruiter added"}
            </h3>
            <p className="text-sm text-gray-500">
              {recruiter.first_name} {recruiter.last_name}
            </p>
          </div>
        </div>

        {email_sent ? (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            <i className="fa-solid fa-envelope-circle-check mr-2"></i>
            Login details were emailed to <strong>{recruiter.email}</strong>.
          </div>
        ) : (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <i className="fa-solid fa-triangle-exclamation mr-2"></i>
            The email could not be sent. Please give these details to {recruiter.first_name} yourself.
          </div>
        )}

        <dl className="space-y-3 rounded-lg bg-gray-50 p-4 text-sm">
          <div>
            <dt className="text-xs uppercase text-gray-500">Login page</dt>
            <dd className="break-all text-gray-800">{loginUrl}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-gray-500">Email</dt>
            <dd className="text-gray-800">{recruiter.email}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-gray-500">Temporary password</dt>
            <dd className="select-all font-mono text-base font-semibold text-gray-900">{temporary_password}</dd>
          </div>
        </dl>

        <p className="mt-3 text-xs text-gray-500">
          This password is shown only once. {recruiter.first_name} will be asked to choose their own
          the first time they log in.
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={copy}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <i className={`fa-solid ${copied ? "fa-check" : "fa-copy"} mr-2`}></i>
            {copied ? "Copied" : "Copy details"}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

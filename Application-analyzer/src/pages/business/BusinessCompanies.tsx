import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CompaniesPanel from "../../components/business/CompaniesPanel";

/** /business/companies: every company, with a form to register a new one. */
export default function BusinessCompanies() {
  return (
    <div className="space-y-6">
      <ToastContainer />
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Companies</h1>
        <p className="text-sm text-gray-500">
          Register a company, then add its recruiters. They get a temporary password by email.
        </p>
      </div>
      <CompaniesPanel />
    </div>
  );
}

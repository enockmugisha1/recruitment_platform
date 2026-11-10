import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import AuthLayout from './components/AuthLayout'
import Home from './pages/Home'
import Jobs from './pages/Jobs'
import JobDetail from './pages/JobDetail'
import CreateJob from './pages/CreateJob'
import Candidates from './pages/Candidates'
import CandidateDetail from './pages/CandidateDetail'
import Reports from './pages/Reports'
import Calendar from './pages/Calendar'
import JobSeekerDashboard from './pages/JobSeekerDashboard'
import Profile from './pages/Profile'
import BrowseJobs from './pages/BrowseJobs'
import MyApplications from './pages/MyApplications'
import SavedJobs from './pages/SavedJobs'
import Settings from './pages/Settings'
import Help from './pages/Help'
import AdminLayout from './layouts/AdminLayout'
import JobSeekerLayout from './layouts/JobSeekerLayout'
import SharedLayout from './layouts/SharedLayout'

import ErrorBoundary from './components/ErrorBoundary'
import Team from './pages/Team'
import ChangePassword from './pages/ChangePassword'
import BusinessLogin from './pages/business/BusinessLogin'
import BusinessLayout from './pages/business/BusinessLayout'
import BusinessCompanies from './pages/business/BusinessCompanies'
import BusinessCompanyDetail from './pages/business/BusinessCompanyDetail'

const router = createBrowserRouter(createRoutesFromElements(
  <Route errorElement={<ErrorBoundary />}>
    {/* Recruiter Routes */}
    <Route path='/' element={<AdminLayout />}>
      <Route index element={<Home />} />
      <Route path='/jobs' element={<Jobs />} />
      <Route path='/jobs/create' element={<CreateJob />} />
      <Route path='/jobs/:id' element={<JobDetail />} />
      <Route path="/candidates" element={<Candidates />} />
      <Route path="/candidates/:id" element={<CandidateDetail />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/team" element={<Team />} />
    </Route>

    {/* Business portal (ThinkGreen Afrika): register companies, create their recruiters */}
    <Route path='/business/login' element={<BusinessLogin />} />
    <Route path='/business' element={<BusinessLayout />}>
      <Route index element={<BusinessCompanies />} />
      <Route path='companies/:id' element={<BusinessCompanyDetail />} />
    </Route>

    {/* Any logged-in user: choose / change your password */}
    <Route path='/change-password' element={<ChangePassword />} />

    {/* Job Seeker Routes */}
    <Route element={<JobSeekerLayout />}>
      <Route path='/dashboard' element={<JobSeekerDashboard />} />
      <Route path='/browse-jobs' element={<BrowseJobs />} />
      <Route path='/my-applications' element={<MyApplications />} />
      <Route path='/saved-jobs' element={<SavedJobs />} />
      <Route path='/profile' element={<Profile />} />
    </Route>

    {/* Shared Routes — reachable by either role, chrome adapts to whoever is logged in */}
    <Route element={<SharedLayout />}>
      <Route path="/settings" element={<Settings />} />
      <Route path="/help" element={<Help />} />
    </Route>

    {/* Auth Routes */}
    <Route element={<AuthLayout />}>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Route>
  </Route>
))


function App() {

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App


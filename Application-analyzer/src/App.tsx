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
import CandidateLayout from './features/candidates/layout/CandidateLayout'
import CandGeneral from './features/candidates/pages/CandGeneral'
import JobSeekerDashboard from './pages/JobSeekerDashboard'
import Profile from './pages/Profile'
import BrowseJobs from './pages/BrowseJobs'
import MyApplications from './pages/MyApplications'
import AdminLayout from './layouts/AdminLayout'
import JobSeekerLayout from './layouts/JobSeekerLayout'

import ErrorBoundary from './components/ErrorBoundary'

const router = createBrowserRouter(createRoutesFromElements(
  <Route errorElement={<ErrorBoundary />}>
    {/* Admin/Recruiter Routes */}
    <Route path='/' element={<AdminLayout />}>
      <Route index element={<Home />} />
      <Route path='/jobs' element={<Jobs />} />
      <Route path='/jobs/create' element={<CreateJob />} />
      <Route path='/jobs/:id' element={<JobDetail />} />
      <Route path="/candidates" element={<Candidates />} />
      <Route path="/candidates/:id" element={<CandidateDetail />} />
      <Route path="/candidates/:candId" element={<CandidateLayout />}>
        <Route index element={<CandGeneral />} />
        <Route path='evaluations' element={<h1>evaluations route</h1>} />
        <Route path='experience' element={<h1>experience route</h1>} />
        <Route path='education' element={<h1>education route</h1>} />
      </Route>
      <Route path="/reports" element={<Reports />} />
      <Route path="/calendar" element={<Calendar />} />
    </Route>

    {/* Job Seeker Routes */}
    <Route element={<JobSeekerLayout />}>
      <Route path='/dashboard' element={<JobSeekerDashboard />} />
      <Route path='/browse-jobs' element={<BrowseJobs />} />
      <Route path='/my-applications' element={<MyApplications />} />
      <Route path='/profile' element={<Profile />} />
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


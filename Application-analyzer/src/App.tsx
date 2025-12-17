import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from 'react-router-dom'
import Layout from './components/Layout'
import Signup from './pages/Signup'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import AuthLayout from './components/AuthLayout'
import Home from './pages/Home'
import Jobs from './pages/Jobs'
import CreateJob from './pages/CreateJob'
import Candidates from './pages/Candidates'
import Reports from './pages/Reports'
import Calendar from './pages/Calendar'
import CandidateLayout from './features/candidates/layout/CandidateLayout'
import CandGeneral from './features/candidates/pages/CandGeneral'
import JobSeekerDashboard from './pages/JobSeekerDashboard'
import Profile from './pages/Profile'

const router = createBrowserRouter(createRoutesFromElements(
  <>
    <Route path='/' element={
      <Layout />}>
      <Route index element={<Home />} />
      <Route path='/dashboard' element={<JobSeekerDashboard />} />
      <Route path='/profile' element={<Profile />} />
      <Route path='/jobs' element={<Jobs />} />
      <Route path='/jobs/create' element={<CreateJob />} />
      <Route path="/candidates" element={<Candidates />} />
      <Route path="/candidates/:candId" element={<CandidateLayout />}>
        <Route index element={<CandGeneral />} />
        <Route path='evaluations' element={<h1>evaluations route</h1>} />
        <Route path='experience' element={<h1>experience route</h1>} />
        <Route path='education' element={<h1>education route</h1>} />

      </Route>

      <Route path="/reports" element={<Reports />} />
      <Route path="/calendar" element={<Calendar />} />
    </Route>
    <Route element={<AuthLayout />}>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Route>
  </>
))


function App() {

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App

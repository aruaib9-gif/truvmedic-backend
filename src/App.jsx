import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// Public Layout
import Layout from './components/layout/Layout';

// Admin Layout
import AdminLayout from './components/admin/AdminLayout';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Industries from './pages/Industries';
import Technology from './pages/Technology';
import Careers from './pages/Careers';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import Emergency from './pages/Emergency';
import ApplicantDashboard from './pages/ApplicantDashboard';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AcceptInvite from './pages/auth/AcceptInvite';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import LeadsManager from './pages/admin/LeadsManager';
import EmergencyAdmin from './pages/admin/EmergencyAdmin';
import ApplicationsAdmin from './pages/admin/ApplicationsAdmin';
import JobPostingsAdmin from './pages/admin/JobPostingsAdmin';
import BlogAdmin from './pages/admin/BlogAdmin';
import TestimonialsAdmin from './pages/admin/TestimonialsAdmin';
import ContentEditor from './pages/admin/ContentEditor';
import SiteConfigAdmin from './pages/admin/SiteConfigAdmin';
import CandidateDatabase from './pages/admin/CandidateDatabase';
import UserManagement from './pages/admin/UserManagement';
import RolePermissions from './pages/admin/RolePermissions';
import InternalMessaging from './pages/admin/InternalMessaging';

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Routes>
            {/* Public website */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/industries" element={<Industries />} />
              <Route path="/technology" element={<Technology />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/emergency" element={<Emergency />} />

              {/* Signed-in applicants */}
              <Route element={<ProtectedRoute />}>
                <Route path="/applicant-dashboard" element={<ApplicantDashboard />} />
              </Route>
            </Route>

            {/* Authentication */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/accept-invite" element={<AcceptInvite />} />

            {/* Admin / CRM portal — staff roles only */}
            <Route element={<ProtectedRoute requireStaff />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="leads" element={<LeadsManager />} />
                <Route path="emergencies" element={<EmergencyAdmin />} />
                <Route path="applications" element={<ApplicationsAdmin />} />
                <Route path="job-postings" element={<JobPostingsAdmin />} />
                <Route path="blog" element={<BlogAdmin />} />
                <Route path="testimonials" element={<TestimonialsAdmin />} />
                <Route path="content" element={<ContentEditor />} />
                <Route path="site-config" element={<SiteConfigAdmin />} />
                <Route path="candidates" element={<CandidateDatabase />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="role-permissions" element={<RolePermissions />} />
                <Route path="messaging" element={<InternalMessaging />} />
              </Route>
            </Route>

            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
        <Toaster />
        <SonnerToaster richColors position="top-right" />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App

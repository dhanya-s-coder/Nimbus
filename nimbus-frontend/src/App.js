import "./App.css";
import { Routes, Route } from 'react-router-dom';
import Home from "./components/home/Home";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import ForgotPassword from "./components/auth/ForgotPassword";
import VerifyOTP from "./components/auth/VerifyOTP";
import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/profile/Profile";
import ProtectedRoute from "./components/zprotect/ProtectedRoute";
import PublicRoute from "./components/zprotect/PublicRoute";
import EmailGenerator from "./components/tools/EmailGenerator";
import LogoIdeas from "./components/tools/LogoGenerator";
import PosterGenerator from "./components/tools/PosterGenerator";
import ReportGenerator from "./components/tools/ReportGenerator";
import Activity from "./components/tools/history/activity";
import { HistoryProvider } from "./context/HistoryContext";
import ProtectedLayout from './components/zprotect/ProtectedLayout'

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<PublicRoute element={<Login />} />} />
        <Route path="/signup" element={<PublicRoute element={<Signup />} />} />
        <Route path="/forgot-password" element={<PublicRoute element={<ForgotPassword />} />} />
        <Route path="/verify-otp" element={<PublicRoute element={<VerifyOTP />} />} />

        {/* Protected Routes*/}
        <Route element={
          <ProtectedRoute element={
            <HistoryProvider>
              <ProtectedLayout />
            </HistoryProvider>
          } />
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/email-generator" element={<EmailGenerator />} />
          <Route path="/poster-generator" element={<PosterGenerator />} />
          <Route path="/logo-generator" element={<LogoIdeas />} />
          <Route path="/report-generator" element={<ReportGenerator />} />
          <Route path="/activity" element={<Activity />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;


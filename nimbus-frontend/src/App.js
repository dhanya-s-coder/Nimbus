import "./App.css";
import { useLocation } from "react-router-dom";
import { Routes, Route } from 'react-router-dom';
import Home from "./components/home/Home";
import Login from "./components/auth/login/Login";
import Signup from "./components/auth/signup/Signup";
import ForgotPassword from "./components/auth/forgot-password/ForgotPassword";
import VerifyOTP from "./components/auth/verify-otp/VerifyOTP";
import Dashboard from "./components/dashboard/Dashboard";
// import Profile from './components/tools/profile/profile';
import Profile from "./components/profile/Profile";
import ProtectedRoute from "./components/zprotect/ProtectedRoute";
import PublicRoute from "./components/zprotect/PublicRoute";
import EmailDraft from "./components/tools/email-gen/EmailDraft";
import LogoIdeas from "./components/tools/logo-gen/LogoIdeas";
import Settings from "./components/tools/settings/Settings";
import Activity from "./components/tools/history/Activity";
import { HistoryProvider } from "./context/HistoryContext";
import ProtectedLayout from './components/common/ProtectedLayout'

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
          <Route path="/email-draft" element={<EmailDraft />} />
          <Route path="/logo-ideas" element={<LogoIdeas />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/activity" element={<Activity />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;

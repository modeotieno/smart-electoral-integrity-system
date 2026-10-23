import React from "react";
import { Outlet, Route, Routes } from "react-router-dom";

import AboutPage from "./pages/About/About";
import ContactPage from "./pages/Contact/Contact";
import FeaturesPage from "./pages/Features/Features";
import GetStarted from "./pages/GetStarted/GetStarted.jsx";
import LiveStreamPage from "./pages/LiveStream/LiveStream";
import LoginPage from "./pages/Login/Login.jsx";
import RegisterPage from "./pages/Register/Register";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardOverview from "./components/dashboard/DashboardOverview";
import Voters from "./components/dashboard/Voters";
import Candidates from "./components/dashboard/Candidates";
import CandidatePortal from "./components/dashboard/CandidatePortal";
import Stations from "./components/dashboard/Stations";
import Results from "./components/dashboard/Results";
import Reports from "./components/dashboard/Reports";
import Elections from "./components/dashboard/Elections";
import PublicLayout from "./components/layout/PublicLayout";
import { RequireAuth } from "./components/auth/RequireAuth";
import {
  HomeLayout,
  HowItWorksPage,
  WhoWeServePage,
} from "./components/marketing/MarketingSections";

function BiometricPageWrapper() {
  const Biometric = React.lazy(() => import("./pages/Biometric/Biometric"));

  return (
    <React.Suspense fallback={<div style={{ padding: 40 }}>Loading biometric...</div>}>
      <Biometric />
    </React.Suspense>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardOverview />} />
        <Route path="elections" element={<Elections />} />
        <Route path="voters" element={<Voters />} />
        <Route path="candidates" element={<Candidates />} />
        <Route path="candidate-portal" element={<CandidatePortal />} />
        <Route path="stations" element={<Stations />} />
        <Route path="results" element={<Results />} />
        <Route path="reports" element={<Reports />} />
        <Route path="biometric" element={<BiometricPageWrapper />} />
      </Route>

      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomeLayout />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/who-we-serve" element={<WhoWeServePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<GetStarted />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/biometric" element={<BiometricPageWrapper />} />
        <Route path="/live-stream" element={<LiveStreamPage />} />
        <Route path="/live" element={<LiveStreamPage />} />
      </Route>
    </Routes>
  );
}

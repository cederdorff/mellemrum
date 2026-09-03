import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";

import HomePage from "./pages/HomePage";

/* LAZY LOADING AF SIDER */
const AboutPage = lazy(() => import("./pages/AboutPage"));
const EventPage = lazy(() => import("./pages/EventPage"));
const RegistrationsPage = lazy(() => import("./pages/RegistrationsPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const CreateEventPage = lazy(() => import("./pages/CreateEventPage"));
const EditEventPage = lazy(() => import("./pages/EditEventPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

export default function App() {
  return (
    <>
      <ScrollToTop />

      <Navbar />

      <div className="page-content">
        <Suspense
          fallback={
            <div className="page-loading">
              <p>Indlæser...</p>
            </div>
          }
        >
          <Routes>
            {/* FORSIDE */}
            <Route path="/" element={<HomePage />} />

            {/* OM MELLEMRUM */}
            <Route path="/om" element={<AboutPage />} />

            {/* ENKELT EVENT */}
            <Route path="/events/:eventId" element={<EventPage />} />

            {/* TILMELDINGSOVERBLIK */}
            <Route path="/tilmeldinger" element={<RegistrationsPage />} />

            {/* LOGIN */}
            <Route path="/login" element={<LoginPage />} />

            {/* GLEMT ADGANGSKODE */}
            <Route path="/glemt-adgangskode" element={<ForgotPasswordPage />} />

            {/* NY ADGANGSKODE */}
            <Route
              path="/nulstil-adgangskode"
              element={<ResetPasswordPage />}
            />

            {/* PROFIL - KRÆVER LOGIN */}
            <Route
              path="/profil"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* OPRET EVENT - KRÆVER LOGIN */}
            <Route
              path="/opret-event"
              element={
                <ProtectedRoute>
                  <CreateEventPage />
                </ProtectedRoute>
              }
            />

            {/* REDIGER EVENT - KRÆVER LOGIN */}
            <Route
              path="/events/:eventId/rediger"
              element={
                <ProtectedRoute>
                  <EditEventPage />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </div>

      <Footer />
    </>
  );
}

import { Routes, Route } from "react-router";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import EventPage from "./pages/EventPage";
import RegistrationsPage from "./pages/RegistrationsPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import CreateEventPage from "./pages/CreateEventPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFoundPage from "./pages/NotFoundPage";
import EditEventPage from "./pages/EditEventPage";

export default function App() {
  return (
    <>
      <ScrollToTop />

      <Navbar />

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

        {/* VÆLG NY ADGANGSKODE */}
        <Route path="/nulstil-adgangskode" element={<ResetPasswordPage />} />

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

        <Route
          path="/events/:eventId/rediger"
          element={
            <ProtectedRoute>
              <EditEventPage />
            </ProtectedRoute>
          }
        />

        {/* 404 - HVIS SIDEN IKKE FINDES */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <Footer />
    </>
  );
}

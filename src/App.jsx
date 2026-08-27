import { Routes, Route } from "react-router";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import EventPage from "./pages/EventPage";
import RegistrationsPage from "./pages/RegistrationsPage";
import NotFoundPage from "./pages/NotFoundPage";
import ScrollToTop from "./components/ScrollToTop";


export default function App() {
  return (
    <>
    <ScrollToTop />
    
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/events/:eventId" element={<EventPage />} />
        <Route path="/om" element={<AboutPage />} />
        <Route path="/tilmeldinger" element={<RegistrationsPage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/footer" element={<Footer />} />
      </Routes>
      <Footer />
    </>
  );
}

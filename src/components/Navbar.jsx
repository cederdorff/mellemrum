import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="site-nav">
      <Link to="/" className="brand">
        mellemrum<span>.</span>
      </Link>

      <div className="nav-links">
        <a className="hero-link" href="#events">
          Events
        </a>
        <Link to="/om">Om Mellemrum</Link>

        {user ? (
          <>
            <Link to="/opret-event">Opret event</Link>

            <Link to="/profil">Profil</Link>

            <button className="logout-button" onClick={signOut}>
              Log ud
            </button>
          </>
        ) : (
          <Link to="/login">Log ind</Link>
        )}
      </div>
    </nav>
  );
}

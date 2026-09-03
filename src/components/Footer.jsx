import { Link } from "react-router";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-intro">
          <Link to="/" className="footer-brand">
            Mellem<span>rum</span>
          </Link>

          <p>Udvalgte kulturoplevelser og nye perspektiver på Aarhus.</p>
        </div>

        <div className="footer-links">
          <div className="footer-link-group">
            <p className="footer-heading">Udforsk</p>

            <Link to="/">Forside</Link>
            <Link to="/om">Om Mellemrum</Link>
            <Link to="/tilmeldinger">Tilmeldinger</Link>
          </div>

          <div className="footer-link-group">
            <p className="footer-heading">Kontakt</p>

            <a href="tel:+4512345678">+45 12 34 56 78</a>
            <a href="mailto:kontakt@mellemrum.dk">kontakt@mellemrum.dk</a>

            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Mellemrum</p>
        <p>Aarhus, Danmark</p>
      </div>
    </footer>
  );
}

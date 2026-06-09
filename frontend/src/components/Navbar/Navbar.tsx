import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <header className={styles.navbar}>
      <div className={styles.brand}>MyCompany</div>
      <nav>
        <Link className={styles.signinLink} to="/signin">
          Sign In
        </Link>
      </nav>
    </header>
  );
}

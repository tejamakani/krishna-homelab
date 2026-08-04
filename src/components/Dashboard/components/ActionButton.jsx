import Link from "@docusaurus/Link";
import styles from "../Dashboard.module.css";

export default function ActionButton({
  label,
  href,
}) {
  return (
    <Link
      to={href}
      className={styles.actionButton}
    >
      {label} →
    </Link>
  );
}
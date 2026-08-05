import React from "react";
import Link from "@docusaurus/Link";
import styles from "../Hero.module.css";

export default function HeroButtons() {
  return (
    <div className={styles.heroButtons}>
      <Link
        className="button button--primary button--lg"
        to="/docs/playbook/vision"
      >
        📘 Start Reading
      </Link>

      <Link
        className="button button--secondary button--lg"
        to="/docs/architecture"
      >
        🏗️ Explore Architecture
      </Link>
    </div>
  );
}
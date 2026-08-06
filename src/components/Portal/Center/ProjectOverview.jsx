import styles from "../PortalLayout.module.css";

import TechnologyPills from "./TechnologyPills";
import ActionButtons from "./ActionButtons";

export default function ProjectOverview() {
  return (
    <article className={styles.projectOverview}>
      <h2>Project Overview</h2>

      <p>
        Makani&apos;s HomeAuto is an evolving smart-home engineering project
        that demonstrates the complete implementation of modern
        infrastructure technologies. From virtualization and containerization
        to home automation and AI-assisted surveillance, every component is
        designed to work together as one secure ecosystem.
      </p>

      <TechnologyPills />

      <ActionButtons />
    </article>
  );
}
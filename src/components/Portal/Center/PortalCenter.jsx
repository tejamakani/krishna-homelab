import styles from "../PortalLayout.module.css";

import HeroSection from "./HeroSection";
import CapabilityGrid from "./CapabilityGrid";
import ProjectOverview from "./ProjectOverview";

export default function PortalCenter() {
  return (
    <section className={styles.portalCenter}>
      <HeroSection />
      <CapabilityGrid />
      <ProjectOverview />
    </section>
  );
}
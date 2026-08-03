import React from "react";
import styles from "./Hero.module.css";

import AnimatedBackground from "./AnimatedBackground";
import ServerStatusCard from "./ServerStatusCard";
import HeroButtons from "./HeroContent/HeroButtons";
import TechnologyPills from "./HeroContent/TechnologyPills";

export default function Hero() {
  return (
    <section className={styles.hero}>

      {/* Background Animation */}  
      <AnimatedBackground />

      <div className={styles.container}>

        {/* LEFT COLUMN */}
        <div className={styles.left}>

          <div className={styles.badge}>
            SELF-HOSTED ENGINEERING LAB
          </div>

          <h1 className={styles.title}>
            🏠 Makani's Home-Lab
            </h1>

            <h2 className={styles.subtitle}>
              Engineering a Smarter Home,
              <br />
              One Service at a Time.
            </h2>

          <p className={styles.description}>
            A production-inspired HomeLab built using
            <strong> Proxmox VE</strong>,
            <strong> Home Assistant</strong>,
            <strong> Frigate AI</strong>,
            <strong> Coral TPU</strong>, and
            <strong> Enterprise Networking</strong>.
          </p>

          <HeroButtons />

          <TechnologyPills />

        </div>

        {/* RIGHT COLUMN */}

        <div className={styles.right}>

          <ServerStatusCard />

        </div>

      </div>

    </section>
  );
}
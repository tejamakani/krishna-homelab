import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();

  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container" style={{padding: '4rem 0', textAlign: 'center'}}>

        <Heading as="h1" className="hero__title">
          🏠 Makani HomeLab
        </Heading>

        <p className="hero__subtitle">
          Enterprise-grade Smart Home Infrastructure
        </p>

        <p style={{
          fontSize: '1.25rem',
          maxWidth: '850px',
          margin: '2rem auto',
          lineHeight: '1.8'
        }}>
          A complete HomeLab built using <strong>Proxmox VE</strong>,
          <strong> Home Assistant</strong>,
          <strong> Frigate NVR</strong>,
          <strong> Coral TPU</strong>,
          enterprise networking, and modern automation.
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          <Link
           className="button button--lg"
            style={{
           backgroundColor: "#ffffff",
           color: "#1f2937",
            border: "2px solid #ffffff"
            }}
            to="/docs/engineering-foundation"
            >
            📖 Documentation
          </Link>

          <Link
            className="button button--secondary button--lg"
            to="/docs/architecture">
            📊 Architecture
          </Link>
        </div>

      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
return (
  <Layout
    title="Makani HomeLab"
    description="Documentation for my HomeLab infrastructure built with Proxmox, Home Assistant, Frigate AI, Coral TPU and enterprise networking."
  >
    <HomepageHeader />

    <main>
      <HomepageFeatures />
    </main>
  </Layout>
);
}

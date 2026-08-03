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
      <div className="container">

        <Heading as="h1" className="hero__title">
          🏠 {siteConfig.title}
        </Heading>

        <p className="hero__subtitle">
          {siteConfig.tagline}
        </p>

        <p style={{fontSize: '1.2rem', marginTop: '20px'}}>
          Build your own Smart Home with
          <br />
          🖥️ Proxmox • 🏡 Home Assistant • 🎥 Frigate AI • 🧠 Coral TPU
        </p>

        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            📖 Start Reading
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
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}

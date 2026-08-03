import clsx from 'clsx';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

const FeatureList = [
  {
    icon: '🖥️',
    title: 'Proxmox VE',
    link: '/docs/proxmox/install',
    description: 'Virtualization platform powering the HomeLab infrastructure.',
  },
  {
    icon: '🏡',
    title: 'Home Assistant',
    link: '/docs/homeassistant/installation',
    description: 'Smart home automation, dashboards and integrations.',
  },
  {
    icon: '🎥',
    title: 'Frigate AI',
    link: '/docs/frigate/installation',
    description: 'AI-powered object detection using Coral TPU acceleration.',
  },
  {
    icon: '🌐',
    title: 'Networking',
    link: '/docs/network/topology',
    description: 'VLANs, switching, routing and enterprise network design.',
  },
  {
    icon: '📷',
    title: 'Hardware',
    link: '/docs/hardware',
    description: 'Servers, storage, Coral TPU, cameras and networking gear.',
  },
  {
    icon: '📊',
    title: 'Architecture',
    link: '/docs/architecture',
    description: 'Interactive diagrams and complete HomeLab topology.',
  },
];

function Feature({ icon, title, description, link }) {
  return (
    <div className={clsx('col col--4 margin-bottom--lg')}>
      <div
        style={{
          border: '1px solid var(--ifm-color-emphasis-300)',
          borderRadius: '16px',
          padding: '30px',
          height: '100%',
          textAlign: 'center',
          transition: '0.3s',
        }}
      >
        <div style={{ fontSize: '3rem' }}>{icon}</div>

        <Heading as="h3">{title}</Heading>

        <p>{description}</p>

        <Link className="button button--primary button--sm" to={link}>
          Learn More →
        </Link>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <Heading as="h2" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          Explore the HomeLab
        </Heading>

        <div className="row">
          {FeatureList.map((feature, idx) => (
            <Feature key={idx} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
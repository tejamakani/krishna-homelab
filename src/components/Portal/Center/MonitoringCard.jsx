import { useState } from "react";
import {
  Activity,
  FlaskConical,
  Server,
  ArrowRight,
} from "lucide-react";

import styles from "../PortalLayout.module.css";

import DetailPanel from "../RightPanel/DetailPanel";
import { labMetrics } from "../RightPanel/labMetrics";
import { productionMetrics } from "../RightPanel/productionMetrics";

function EnvironmentMetric({
  metric,
  onSelect,
}) {
  return (
    <button
      type="button"
      className={styles.monitorMetric}
      onClick={() => onSelect(metric)}
    >
      <div>
        <strong>{metric.title}</strong>
        <span>{metric.summary}</span>
      </div>

      <span
        className={styles.monitorStatus}
        style={{ color: metric.statusColor }}
      >
        <span
          className={styles.monitorStatusDot}
          style={{
            backgroundColor: metric.statusColor,
          }}
        />

        {metric.status}
      </span>
    </button>
  );
}

function MonitoringEnvironment({
  title,
  icon: Icon,
  metrics,
  onSelect,
}) {
  return (
    <section className={styles.monitorEnvironment}>
      <div className={styles.monitorEnvironmentHeader}>
        <div>
          <Icon size={17} strokeWidth={1.8} />
          <strong>{title}</strong>
        </div>

        <span className={styles.environmentHealthy}>
          <span className={styles.monitorStatusDot} />
          Healthy
        </span>
      </div>

      <div className={styles.monitorMetricGrid}>
        {metrics.map((metric) => (
          <EnvironmentMetric
            key={metric.id}
            metric={metric}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}

export default function MonitoringCard() {
  const [selectedWidget, setSelectedWidget] =
    useState(null);

  return (
    <>
      <article className={styles.primaryPortalCard}>
        <div className={styles.primaryCardHeader}>
          <div className={styles.primaryCardIcon}>
            <Activity size={24} strokeWidth={1.8} />
          </div>

          <div>
            <span className={styles.primaryCardEyebrow}>
              ENVIRONMENT OVERVIEW
            </span>

            <h2>Platform Monitoring</h2>
          </div>
        </div>

        <p className={styles.primaryCardDescription}>
          Monitor platform health, application status, AI services,
          and infrastructure across Lab and Production environments.
        </p>

        <div className={styles.monitoringEnvironments}>
          <MonitoringEnvironment
            title="Lab Environment"
            icon={FlaskConical}
            metrics={labMetrics}
            onSelect={setSelectedWidget}
          />

          <MonitoringEnvironment
            title="Production"
            icon={Server}
            metrics={productionMetrics}
            onSelect={setSelectedWidget}
          />
        </div>

        <button
          type="button"
          className={styles.primaryCardActionButton}
        >
          Open Monitoring Dashboard
          <ArrowRight size={17} strokeWidth={1.8} />
        </button>
      </article>

      <DetailPanel
        widget={selectedWidget}
        onClose={() => setSelectedWidget(null)}
      />
    </>
  );
}
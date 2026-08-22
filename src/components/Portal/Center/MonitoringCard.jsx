import { useMemo, useState } from "react";
import {
  Activity,
  FlaskConical,
  Server,
  ArrowRight,
} from "lucide-react";

import styles from "../PortalLayout.module.css";

import DetailPanel from "../RightPanel/DetailPanel";

import { buildLabMetrics } from "../RightPanel/labMetrics";
import { productionMetrics } from "../RightPanel/productionMetrics";

import useLabTelemetry from "../RightPanel/hooks/useLabTelemetry";

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
  metrics = [],
  onSelect,
  environmentStatus = "Healthy",
  environmentStatusColor = "#22c55e",
}) {
  return (
    <section className={styles.monitorEnvironment}>
      <div className={styles.monitorEnvironmentHeader}>
        <div>
          <Icon size={17} strokeWidth={1.8} />
          <strong>{title}</strong>
        </div>

        <span
          className={styles.environmentHealthy}
          style={{
            color: environmentStatusColor,
          }}
        >
          <span
            className={styles.monitorStatusDot}
            style={{
              backgroundColor:
                environmentStatusColor,
            }}
          />

          {environmentStatus}
        </span>
      </div>

      <div className={styles.monitorMetricGrid}>
        {metrics.length > 0 ? (
          metrics.map((metric) => (
            <EnvironmentMetric
              key={metric.id}
              metric={metric}
              onSelect={onSelect}
            />
          ))
        ) : (
          <div className={styles.monitorMetric}>
            <div>
              <strong>Live Telemetry</strong>
              <span>Connecting...</span>
            </div>

            <span
              className={styles.monitorStatus}
              style={{ color: "#38bdf8" }}
            >
              <span
                className={styles.monitorStatusDot}
                style={{
                  backgroundColor: "#38bdf8",
                }}
              />

              Loading
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

function getLabEnvironmentStatus({
  telemetry,
  loading,
  error,
}) {
  if (loading) {
    return {
      text: "Connecting",
      color: "#38bdf8",
    };
  }

  if (error || !telemetry) {
    return {
      text: "Telemetry Offline",
      color: "#ef4444",
    };
  }

  if (telemetry.freshness === "offline") {
    return {
      text: "Offline",
      color: "#ef4444",
    };
  }

  if (telemetry.freshness === "stale") {
    return {
      text: "Stale",
      color: "#f59e0b",
    };
  }

  return {
    text: `Live · ${telemetry.age_seconds ?? 0}s`,
    color: "#22c55e",
  };
}

export default function MonitoringCard() {
  const [selectedWidget, setSelectedWidget] =
    useState(null);

  const {
    telemetry,
    loading,
    error,
  } = useLabTelemetry();

  const labMetrics = useMemo(() => {
    return buildLabMetrics(telemetry);
  }, [telemetry]);

  const labEnvironmentStatus = useMemo(() => {
    return getLabEnvironmentStatus({
      telemetry,
      loading,
      error,
    });
  }, [
    telemetry,
    loading,
    error,
  ]);

  /*
   * Keep an already-open Lab drawer synchronized
   * with fresh telemetry.
   */
  const activeWidget = useMemo(() => {
    if (!selectedWidget) {
      return null;
    }

    if (
      selectedWidget.environment ===
      "LAB ENVIRONMENT"
    ) {
      return (
        labMetrics.find(
          (metric) =>
            metric.id === selectedWidget.id
        ) || selectedWidget
      );
    }

    return selectedWidget;
  }, [
    selectedWidget,
    labMetrics,
  ]);

  return (
    <>
      <section className={styles.monitoringCard}>
        <div className={styles.monitoringCardHeader}>
          <div className={styles.monitoringCardIcon}>
            <Activity
              size={22}
              strokeWidth={1.8}
            />
          </div>

          <div>
            <span className={styles.cardEyebrow}>
              ENVIRONMENT OVERVIEW
            </span>

            <h2>Platform Monitoring</h2>
          </div>
        </div>

        <p className={styles.monitoringDescription}>
          Monitor platform health, application status,
          AI services, and infrastructure across Lab and
          Production environments.
        </p>

        <div className={styles.monitoringEnvironmentList}>
          <MonitoringEnvironment
            title="Lab Environment"
            icon={FlaskConical}
            metrics={labMetrics}
            onSelect={setSelectedWidget}
            environmentStatus={
              labEnvironmentStatus.text
            }
            environmentStatusColor={
              labEnvironmentStatus.color
            }
          />

          <MonitoringEnvironment
            title="Production"
            icon={Server}
            metrics={productionMetrics}
            onSelect={setSelectedWidget}
            environmentStatus="Healthy"
            environmentStatusColor="#22c55e"
          />
        </div>

        <a
          href="#"
          className={styles.monitoringAction}
          onClick={(event) =>
            event.preventDefault()
          }
        >
          Open Monitoring Dashboard

          <ArrowRight
            size={16}
            strokeWidth={1.8}
          />
        </a>
      </section>

      <DetailPanel
        widget={activeWidget}
        onClose={() =>
          setSelectedWidget(null)
        }
      />
    </>
  );
}
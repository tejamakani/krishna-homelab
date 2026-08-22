import { useMemo, useState } from "react";

import styles from "./PortalRightPanel.module.css";

import EnvironmentSummary from "./EnvironmentSummary";
import DetailPanel from "./DetailPanel";

import { buildLabMetrics } from "./labMetrics";
import { productionMetrics } from "./productionMetrics";

import useLabTelemetry from "./hooks/useLabTelemetry";

export default function PortalRightPanel() {
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

  /*
   * Keep the currently-open drawer synchronized
   * with new telemetry.
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
          (widget) =>
            widget.id ===
            selectedWidget.id
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
      <aside className={styles.rightPanel}>
        <EnvironmentSummary
          title="Lab Environment"
          subtitle={
            loading
              ? "CONNECTING..."
              : error
              ? "TELEMETRY OFFLINE"
              : telemetry?.freshness ===
                "live"
              ? `LIVE · ${telemetry.age_seconds}s`
              : telemetry?.freshness ===
                "stale"
              ? "STALE"
              : "OFFLINE"
          }
          widgets={labMetrics}
          onSelect={setSelectedWidget}
        />

        <EnvironmentSummary
          title="Production Environment"
          subtitle="PRODUCTION"
          widgets={productionMetrics}
          onSelect={setSelectedWidget}
        />
      </aside>

      <DetailPanel
        widget={activeWidget}
        onClose={() =>
          setSelectedWidget(null)
        }
      />
    </>
  );
}
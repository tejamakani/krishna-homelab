import { useState } from "react";

import styles from "./PortalRightPanel.module.css";

import EnvironmentSummary from "./EnvironmentSummary";
import DetailPanel from "./DetailPanel";

import { labMetrics } from "./labMetrics";
import { productionMetrics } from "./productionMetrics";

export default function PortalRightPanel() {
  const [selectedWidget, setSelectedWidget] = useState(null);

  return (
    <>
      <aside className={styles.rightPanel}>
        <EnvironmentSummary
          title="Lab Environment"
          subtitle="DEVELOPMENT"
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
        widget={selectedWidget}
        onClose={() => setSelectedWidget(null)}
      />
    </>
  );
}
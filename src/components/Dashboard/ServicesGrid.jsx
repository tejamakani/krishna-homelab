import {
  Activity,
  Server,
  Camera,
  Laptop,
} from "lucide-react";

import MetricCard from "./components/MetricCard";
import { overview } from "../../data/metrics";

import styles from "./Dashboard.module.css";

const icons = {
  services: <Activity size={30} />,
  runningVMs: <Server size={30} />,
  devices: <Laptop size={30} />,
  cameras: <Camera size={30} />,
};

export default function ServicesGrid() {
  return (
    <div className={styles.metricGrid}>
      {overview.map((metric) => (
        <MetricCard
          key={metric.id}
          icon={icons[metric.id]}
          title={metric.title}
          value={metric.value}
          subtitle={metric.subtitle}
        />
      ))}
    </div>
  );
}
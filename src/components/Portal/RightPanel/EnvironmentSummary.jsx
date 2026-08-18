import styles from "./PortalRightPanel.module.css";
import SummaryWidget from "./SummaryWidget";

export default function EnvironmentSummary({
  title,
  subtitle,
  widgets,
  onSelect,
}) {
  return (
    <section className={styles.environmentCard}>
      <div className={styles.environmentHeader}>
        <div>
          <span>{subtitle}</span>
          <h3>{title}</h3>
        </div>
      </div>

      <div className={styles.summaryGrid}>
        {widgets.map((widget) => (
          <SummaryWidget
            key={widget.id}
            widget={widget}
            onClick={onSelect}
          />
        ))}
      </div>
    </section>
  );
}
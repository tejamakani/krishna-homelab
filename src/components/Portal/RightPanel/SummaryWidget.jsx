import styles from "./PortalRightPanel.module.css";

export default function SummaryWidget({ widget, onClick }) {
  return (
    <button
      type="button"
      className={styles.summaryWidget}
      onClick={() => onClick(widget)}
    >
      <div>
        <strong>{widget.title}</strong>
        <span>{widget.summary}</span>
      </div>

      <span
        className={styles.summaryStatus}
        style={{ color: widget.statusColor }}
      >
        {widget.status}
      </span>
    </button>
  );
}
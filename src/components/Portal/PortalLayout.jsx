import styles from "./PortalLayout.module.css";

import PortalSidebar from "./Sidebar/PortalSidebar";
import PortalCenter from "./Center/PortalCenter";
import PortalRightPanel from "./RightPanel/PortalRightPanel";

export default function PortalLayout() {
  return (
    <main className={styles.portal}>
      <PortalSidebar />
      <PortalCenter />
      <PortalRightPanel />
    </main>
  );
}
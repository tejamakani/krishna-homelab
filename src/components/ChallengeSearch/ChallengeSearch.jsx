import React, { useMemo, useState } from "react";

import styles from "./ChallengeSearch.module.css";

const challenges = [
  {
    id: "docker-empty-compose",
    title: "Empty Docker Compose File",
    category: "Docker",
    keywords: [
      "docker",
      "compose",
      "empty compose file",
      "docker-compose.yml",
      "yaml",
    ],
    summary:
      "The original docker-compose.yml existed but was effectively empty, causing Compose operations to fail.",
    link: "#challenge-empty-compose",
  },

  {
    id: "compose-v1-v2",
    title: "Docker Compose v1 vs v2",
    category: "Docker",
    keywords: [
      "docker compose",
      "docker-compose",
      "compose plugin",
      "unable to locate package",
    ],
    summary:
      "The environment initially mixed legacy docker-compose syntax with Docker Compose v2.",
    link: "#challenge-compose-v1-v2",
  },

  {
    id: "multi-stack",
    title: "Managing Multiple Compose Stacks",
    category: "Docker",
    keywords: [
      "dockerctl",
      "compose stacks",
      "stack",
      "service management",
    ],
    summary:
      "Multiple Compose files improved isolation but introduced repetitive operational commands.",
    link: "#challenge-multiple-stacks",
  },

  {
    id: "isolated-restart",
    title: "Restarting One Service Without Affecting Others",
    category: "Service Management",
    keywords: [
      "restart",
      "dockerctl",
      "frigate",
      "mqtt",
      "homeassistant",
      "portainer",
      "dozzle",
    ],
    summary:
      "Stack-wide restarts were replaced with service-level lifecycle operations.",
    link: "#challenge-service-restart",
  },

  {
    id: "dependency-order",
    title: "Dependency-Aware Startup and Shutdown",
    category: "Service Management",
    keywords: [
      "start-all",
      "stop-all",
      "startup",
      "shutdown",
      "dependency",
    ],
    summary:
      "Services needed a predictable startup order and reverse dependency shutdown.",
    link: "#challenge-startup-order",
  },

  {
    id: "portainer-timeout",
    title: "Portainer Initial Administrator Timeout",
    category: "Portainer",
    keywords: [
      "portainer",
      "administrator",
      "setup timeout",
      "no administrator account configured",
      "9443",
    ],
    summary:
      "The Portainer initial administrator setup expired and required an isolated Portainer restart.",
    link: "#challenge-portainer-timeout",
  },

  {
    id: "portainer-csp",
    title: "Portainer Browser Console CSP Warning",
    category: "Portainer",
    keywords: [
      "portainer",
      "csp",
      "content security policy",
      "eval",
      "browser console",
    ],
    summary:
      "Browser CSP warnings were separated from actual Portainer container health.",
    link: "#challenge-portainer-csp",
  },

  {
    id: "mqtt-password",
    title: "Mosquitto Password Creation Returned Empty Password",
    category: "MQTT",
    keywords: [
      "mqtt",
      "mosquitto",
      "password",
      "empty password",
      "passwordfile",
    ],
    summary:
      "Password generation initially returned an empty-password error and required file validation.",
    link: "#challenge-mqtt-password",
  },

  {
    id: "mqtt-exit13",
    title: "Mosquitto Container Exit Code 13",
    category: "MQTT",
    keywords: [
      "mqtt",
      "mosquitto",
      "exit code 13",
      "log file",
      "password file",
      "permission denied",
    ],
    summary:
      "Mosquitto failed because it could not access mounted log and password files.",
    link: "#challenge-mqtt-exit13",
  },

  {
    id: "mqtt-permissions",
    title: "Mosquitto Bind-Mount Permissions",
    category: "MQTT",
    keywords: [
      "1883",
      "uid",
      "gid",
      "permissions",
      "chmod",
      "chown",
      "mosquitto",
    ],
    summary:
      "Bind-mounted files were corrected to UID/GID 1883:1883 with appropriate modes.",
    link: "#challenge-mqtt-permissions",
  },

  {
    id: "sudo-password",
    title: "sudo Password Appeared Not to Work",
    category: "Ubuntu",
    keywords: [
      "sudo",
      "password",
      "ubuntu",
      "terminal",
      "sudo whoami",
    ],
    summary:
      "Linux password input was functioning normally even though characters were not echoed.",
    link: "#challenge-sudo-password",
  },

  {
    id: "camera-ai-boundary",
    title: "Camera Pipeline vs AI Pipeline",
    category: "Camera",
    keywords: [
      "camera",
      "frigate",
      "ai",
      "stream",
      "go2rtc",
      "detection",
    ],
    summary:
      "Camera and stream stability must be validated before troubleshooting AI detection.",
    link: "#challenge-camera-ai",
  },

  {
    id: "usb-camera",
    title: "USB Camera Visibility Across Virtualization",
    category: "Camera",
    keywords: [
      "usb camera",
      "video0",
      "virtualization",
      "windows",
      "ubuntu",
      "frigate",
    ],
    summary:
      "USB camera troubleshooting required validation across host, VM, Ubuntu, and container boundaries.",
    link: "#challenge-usb-camera",
  },

  {
    id: "camera-latency",
    title: "Camera Stream Latency in Home Assistant",
    category: "Home Assistant",
    keywords: [
      "latency",
      "camera",
      "home assistant",
      "advanced camera card",
      "go2rtc",
    ],
    summary:
      "The Home Assistant viewing path showed higher latency and was improved using Advanced Camera Card.",
    link: "#challenge-camera-latency",
  },

  {
    id: "object-integration",
    title: "Object Detection vs Integration Failure",
    category: "Frigate",
    keywords: [
      "object detection",
      "frigate",
      "api",
      "home assistant",
      "mqtt",
      "event",
    ],
    summary:
      "The Frigate HTTP API became the source-validation boundary before troubleshooting integrations.",
    link: "#challenge-object-detection",
  },

  {
    id: "lpr-mqtt",
    title: "LPR Recognized but MQTT Metadata Was Inconsistent",
    category: "LPR",
    keywords: [
      "lpr",
      "license plate",
      "mqtt",
      "ts07jf8179",
      "recognized_license_plate",
      "frigate 0.17.2",
    ],
    summary:
      "LPR recognition and API data were valid while the expected MQTT LPR metadata was inconsistent.",
    link: "#challenge-lpr-mqtt",
  },

  {
    id: "mqtt-diagnosis",
    title: "Avoiding the Wrong MQTT Diagnosis",
    category: "MQTT",
    keywords: [
      "mqtt",
      "broker",
      "lpr",
      "mosquitto",
      "topic",
      "payload",
    ],
    summary:
      "Missing LPR metadata did not mean Mosquitto itself was broken.",
    link: "#challenge-mqtt-diagnosis",
  },

  {
    id: "rest-lpr",
    title: "REST API for LPR",
    category: "LPR",
    keywords: [
      "rest",
      "api",
      "lpr",
      "home assistant",
      "rest sensor",
      "frigate api",
    ],
    summary:
      "The Frigate HTTP API was adopted as the reliable LPR metadata source for Home Assistant.",
    link: "#challenge-lpr-rest",
  },

  {
    id: "face-recognition",
    title: "Face Recognition Had No Stored Faces",
    category: "Face Recognition",
    keywords: [
      "face recognition",
      "faces",
      "api/faces",
      "sub_label",
      "frigate",
      "stored faces",
    ],
    summary:
      "Face-recognition infrastructure was present, but stored face entries were not yet validated.",
    link: "#challenge-face-recognition",
  },

  {
    id: "ha-yaml",
    title: "Home Assistant MQTT Sensor YAML",
    category: "Home Assistant",
    keywords: [
      "home assistant",
      "mqtt sensor",
      "yaml",
      "configuration.yaml",
      "indentation",
    ],
    summary:
      "MQTT sensor configuration required careful YAML nesting and isolated Home Assistant restart.",
    link: "#challenge-ha-yaml",
  },

  {
    id: "ha-restart",
    title: "Avoiding Full HomeLab Restarts During HA Changes",
    category: "Home Assistant",
    keywords: [
      "home assistant",
      "restart",
      "dockerctl",
      "service isolation",
    ],
    summary:
      "Home Assistant changes should restart only Home Assistant rather than the complete HomeLab.",
    link: "#challenge-ha-restart",
  },

  {
    id: "hardware-acceleration",
    title: "Hardware Acceleration Too Early",
    category: "Performance",
    keywords: [
      "coral",
      "gpu",
      "gt 1030",
      "quick sync",
      "acceleration",
      "performance",
    ],
    summary:
      "Functional CPU validation was intentionally prioritized before Coral/GPU acceleration.",
    link: "#challenge-hardware-acceleration",
  },

  {
    id: "docs-light-mode",
    title: "Documentation Light Mode Remained Dark",
    category: "Portal",
    keywords: [
      "light mode",
      "dark mode",
      "css",
      "documentation",
      "theme",
    ],
    summary:
      "Hard-coded dark CSS values prevented the documentation workspace from switching themes.",
    link: "#challenge-light-mode",
  },

  {
    id: "mobile-layout",
    title: "Mobile Portal Layout",
    category: "Portal",
    keywords: [
      "mobile",
      "responsive",
      "portal",
      "layout",
      "css",
    ],
    summary:
      "The portal was redesigned around a simpler responsive full-width workspace.",
    link: "#challenge-mobile-layout",
  },

  {
    id: "capability-cards",
    title: "Capability Cards Consumed Too Much Homepage Space",
    category: "Portal",
    keywords: [
      "capability cards",
      "homepage",
      "documentation",
      "monitoring",
      "layout",
    ],
    summary:
      "Documentation and Monitoring were promoted to the primary workspace hierarchy.",
    link: "#challenge-capability-cards",
  },

  {
    id: "placeholder-monitoring",
    title: "Placeholder Monitoring Data",
    category: "Monitoring",
    keywords: [
      "monitoring",
      "metrics",
      "placeholder",
      "telemetry",
      "dashboard",
    ],
    summary:
      "Illustrative portal metrics need to remain clearly separated from live telemetry.",
    link: "#challenge-placeholder-data",
  },

  {
    id: "lab-resources",
    title: "Lab Resources Widget Was Ambiguous",
    category: "Monitoring",
    keywords: [
      "lab resources",
      "cpu",
      "memory",
      "storage",
      "network",
      "monitoring",
    ],
    summary:
      "The generic Lab Resources widget was removed because its monitored scope was unclear.",
    link: "#challenge-lab-resources",
  },

  {
    id: "lab-prod",
    title: "Lab and Production Metrics Needed Separation",
    category: "Monitoring",
    keywords: [
      "lab",
      "production",
      "monitoring",
      "metrics",
      "environment",
    ],
    summary:
      "Lab and Production indicators were separated to keep environment health explicit.",
    link: "#challenge-environment-metrics",
  },
];

export default function ChallengeSearch() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const categories = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(challenges.map((challenge) => challenge.category))
      ).sort(),
    ];
  }, []);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return challenges.filter((challenge) => {
      const categoryMatch =
        category === "All" || challenge.category === category;

      const searchableText = [
        challenge.title,
        challenge.category,
        challenge.summary,
        ...challenge.keywords,
      ]
        .join(" ")
        .toLowerCase();

      const queryMatch =
        normalizedQuery.length === 0 ||
        searchableText.includes(normalizedQuery);

      return categoryMatch && queryMatch;
    });
  }, [query, category]);

  function clearSearch() {
    setQuery("");
    setCategory("All");
  }

  function handleQuickSearch(value) {
    setQuery(value);
    setCategory("All");
  }

  function handleChallengeClick(event, challenge) {
    event.preventDefault();

    const targetId = challenge.link.replace("#", "");
    const target = document.getElementById(targetId);

    if (!target) {
      console.warn(
        `Challenge section not found: ${targetId}`
      );
      return;
    }

    window.history.pushState(
      null,
      "",
      challenge.link
    );

    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <section className={styles.searchPanel}>
      <div className={styles.searchHeader}>
        <div>
          <span className={styles.eyebrow}>
            ISSUE FINDER
          </span>

          <h2>Search HomeLab Challenges</h2>

          <p>
            Search the known issue library by symptom,
            service, technology, or error message.
          </p>
        </div>

        <div className={styles.resultCounter}>
          {results.length} / {challenges.length}
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchInputWrapper}>
          <span className={styles.searchIcon}>
            ⌕
          </span>

          <input
            type="search"
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Try: MQTT permissions, LPR, camera latency..."
            aria-label="Search HomeLab challenges"
          />

          {query && (
            <button
              type="button"
              className={styles.clearInput}
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <select
          value={category}
          onChange={(event) =>
            setCategory(event.target.value)
          }
          className={styles.categorySelect}
          aria-label="Filter challenges by category"
        >
          {categories.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>

        {(query || category !== "All") && (
          <button
            type="button"
            className={styles.resetButton}
            onClick={clearSearch}
          >
            Reset
          </button>
        )}
      </div>

      <div className={styles.quickSearches}>
        <span>Quick search:</span>

        {[
          "MQTT",
          "Frigate",
          "LPR",
          "Camera",
          "Home Assistant",
          "Docker",
        ].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() =>
              handleQuickSearch(item)
            }
          >
            {item}
          </button>
        ))}
      </div>

      {results.length > 0 ? (
        <div className={styles.resultsGrid}>
          {results.map((challenge) => (
            <a
              key={challenge.id}
              href={challenge.link}
              className={styles.resultCard}
              onClick={(event) =>
                handleChallengeClick(
                  event,
                  challenge
                )
              }
            >
              <div className={styles.resultTop}>
                <span className={styles.category}>
                  {challenge.category}
                </span>

                <span
                  className={styles.arrow}
                  aria-hidden="true"
                >
                  →
                </span>
              </div>

              <strong>
                {challenge.title}
              </strong>

              <p>
                {challenge.summary}
              </p>
            </a>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <strong>
            No matching challenge found.
          </strong>

          <p>
            Try a broader term such as MQTT,
            Frigate, Docker, Camera, or
            Home Assistant.
          </p>

          <button
            type="button"
            onClick={clearSearch}
          >
            Clear Search
          </button>
        </div>
      )}
    </section>
  );
}
import { useCallback, useEffect, useState } from "react";

const TELEMETRY_URL =
  "https://homeauto-telemetry.tejamakani.workers.dev/status";

const POLL_INTERVAL = 30000;

export default function useLabTelemetry() {
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTelemetry = useCallback(async () => {
    try {
      const response = await fetch(TELEMETRY_URL, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `Telemetry request failed: ${response.status}`
        );
      }

      const data = await response.json();

      setTelemetry(data);
      setError(null);
    } catch (err) {
      console.error("HomeAuto telemetry error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTelemetry();

    const interval = window.setInterval(
      loadTelemetry,
      POLL_INTERVAL
    );

    return () => {
      window.clearInterval(interval);
    };
  }, [loadTelemetry]);

  return {
    telemetry,
    loading,
    error,
    refresh: loadTelemetry,
  };
}
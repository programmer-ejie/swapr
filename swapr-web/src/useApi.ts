import { useCallback, useEffect, useState } from "react";
import { api, errorMessage } from "./api";

export function useApi<T>(path: string, initial: T, pollMs = 0) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((value) => value + 1), []);
  useEffect(() => {
    let active = true;
    let inFlight = false;
    setLoading(true);
    const load = async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        const result = await api<T>(path);
        if (active) {
          setData(result);
          setError("");
        }
      } catch (error) {
        if (active) setError(errorMessage(error));
      } finally {
        inFlight = false;
        if (active) setLoading(false);
      }
    };
    void load();
    const timer = pollMs ? window.setInterval(load, pollMs) : undefined;
    return () => {
      active = false;
      if (timer) window.clearInterval(timer);
    };
  }, [path, version, pollMs]);
  return { data, loading, error, reload };
}

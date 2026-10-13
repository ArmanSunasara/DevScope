import { useCallback, useEffect, useState } from "react";

import {
  analyzeSpecializationFit,
  fetchSpecializationRoles,
} from "../../services/api";

export function useSpecializationFit() {
  const [roles, setRoles] = useState([]);
  const [rolesError, setRolesError] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchSpecializationRoles().then((result) => {
      if (cancelled) return;
      if (result.success) {
        setRoles(result.data || []);
      } else {
        setRolesError(result.error);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const runAnalysis = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    setReport(null);

    const result = await analyzeSpecializationFit(payload);

    if (result.success) {
      setReport(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, []);

  const reset = useCallback(() => {
    setReport(null);
    setError(null);
  }, []);

  return {
    roles,
    rolesError,
    report,
    loading,
    error,
    runAnalysis,
    reset,
  };
}

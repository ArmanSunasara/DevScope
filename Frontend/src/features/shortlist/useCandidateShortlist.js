import { useCallback, useState } from "react";

import { analyzeCandidateShortlist } from "../../services/api";

export function useCandidateShortlist() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runShortlist = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    setResult(null);

    const response = await analyzeCandidateShortlist(payload);

    if (response.success) {
      setResult(response.data);
    } else {
      setError(response.error);
    }
    setLoading(false);
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, loading, error, runShortlist, reset };
}

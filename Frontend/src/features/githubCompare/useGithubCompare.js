import { useCallback, useState } from "react";

import { analyzeGithubCompare } from "../../services/api";

export function useGithubCompare() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runCompare = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    setResult(null);

    const response = await analyzeGithubCompare(payload);

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

  return { result, loading, error, runCompare, reset };
}

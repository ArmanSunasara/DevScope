import { useCallback, useState } from "react";

import { analyzeResumeGithubMatch } from "../../services/api";

export function useResumeGithubMatch() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runMatch = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    setResult(null);

    const response = await analyzeResumeGithubMatch(payload);

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

  return { result, loading, error, runMatch, reset };
}

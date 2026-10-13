import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_URL}/api/github`,
  headers: { "Content-Type": "application/json" },
  timeout: 60000,
});

const specializationApi = axios.create({
  baseURL: `${API_URL}/api/specialization`,
  headers: { "Content-Type": "application/json" },
  timeout: 90000,
});

// The shortlist endpoint fans out N GitHub deep-analyses plus N+1 LLM calls,
// so it can comfortably run a couple of minutes for large sheets.
const shortlistApi = axios.create({
  baseURL: `${API_URL}/api/shortlist`,
  timeout: 240000,
});

// Resume parse + GitHub deep-analysis + one LLM matching call.
const resumeMatchApi = axios.create({
  baseURL: `${API_URL}/api/resume-match`,
  timeout: 120000,
});

// Two GitHub deep-analyses (parallel) + one LLM comparison call. Two heavy
// GitHub fetches plus the model round-trip can land around 60-90s on a cold
// cache, so we give it the same 2-minute envelope as resume-match.
const githubCompareApi = axios.create({
  baseURL: `${API_URL}/api/github-compare`,
  headers: { "Content-Type": "application/json" },
  timeout: 180000,
});

const wrapError = (error, fallback) => {
  if (error.code === "ECONNABORTED") {
    return { success: false, error: "Request timed out. Please try again." };
  }
  if (!error.response) {
    return {
      success: false,
      error: "Unable to reach the server. Please check your connection.",
    };
  }
  return {
    success: false,
    error: error.response.data?.error || error.message || fallback,
  };
};

export const analyzeGithubProfile = async (url) => {
  try {
    const response = await api.post("/analyze", { url });
    return { success: true, data: response.data };
  } catch (error) {
    return wrapError(error, "Failed to analyze GitHub profile");
  }
};

export const fetchSpecializationRoles = async () => {
  try {
    const response = await specializationApi.get("/roles");
    return { success: true, data: response.data?.data || [] };
  } catch (error) {
    return wrapError(error, "Failed to load roles");
  }
};

export const analyzeSpecializationFit = async ({ url, roleId, jobDescription }) => {
  try {
    const response = await specializationApi.post("/analyze", {
      url,
      roleId,
      jobDescription,
    });
    return { success: true, data: response.data?.data };
  } catch (error) {
    return wrapError(error, "Failed to analyze specialization fit");
  }
};

export const analyzeCandidateShortlist = async ({
  excelFile,
  jobDescription,
  shortlistCount,
}) => {
  try {
    const formData = new FormData();
    formData.append("excel_file", excelFile);
    formData.append("jobDescription", jobDescription);
    formData.append("shortlistCount", String(shortlistCount));

    const response = await shortlistApi.post("/analyze", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { success: true, data: response.data?.data };
  } catch (error) {
    return wrapError(error, "Failed to shortlist candidates");
  }
};

export const analyzeResumeGithubMatch = async ({ url, resumeFile }) => {
  try {
    const formData = new FormData();
    formData.append("url", url);
    formData.append("resume", resumeFile);

    const response = await resumeMatchApi.post("/analyze", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { success: true, data: response.data?.data };
  } catch (error) {
    return wrapError(error, "Failed to analyze resume vs GitHub");
  }
};

export const analyzeGithubCompare = async ({ profileA, profileB }) => {
  try {
    const response = await githubCompareApi.post("/analyze", {
      profileA,
      profileB,
    });
    return { success: true, data: response.data?.data };
  } catch (error) {
    return wrapError(error, "Failed to compare GitHub profiles");
  }
};

export default api;

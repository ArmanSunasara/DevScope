export const routes = {
  home: "/",
  students: "/students",
  ats: "/students/ats-score",
  specialization: "/students/specialization-fit",
  recruiters: "/recruiters",
  shortlist: "/recruiters/candidate-shortlist",
  resumeGithub: "/recruiters/resume-github-match",
  githubCompare: "/recruiters/github-profile-compare",
};

export const getCurrentRoute = () => window.location.pathname;

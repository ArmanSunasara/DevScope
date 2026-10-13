import { routes } from "../routes";

/**
 * Get route metadata for breadcrumbs and page headers
 */
export function useRouteInfo(currentRoute) {
  const routeMap = {
    [routes.home]: {
      title: "Home",
      breadcrumbs: [{ label: "Home", current: true }],
    },
    [routes.students]: {
      title: "Student Tools",
      breadcrumbs: [
        { label: "Home" },
        { label: "Student Tools", current: true },
      ],
      parent: routes.home,
    },
    [routes.ats]: {
      title: "ATS Score Analyzer",
      description: "Get your GitHub profile scored like a recruiter would",
      badge: "For Students",
      accentColor: "cyan",
      breadcrumbs: [
        { label: "Home" },
        { label: "Student Tools" },
        { label: "ATS Score", current: true },
      ],
      parent: routes.students,
    },
    [routes.specialization]: {
      title: "Specialization Fit Checker",
      description: "See how your skills align with career paths",
      badge: "For Students",
      accentColor: "cyan",
      breadcrumbs: [
        { label: "Home" },
        { label: "Student Tools" },
        { label: "Specialization Fit", current: true },
      ],
      parent: routes.students,
    },
    [routes.recruiters]: {
      title: "Recruiter Tools",
      breadcrumbs: [
        { label: "Home" },
        { label: "Recruiter Tools", current: true },
      ],
      parent: routes.home,
    },
    [routes.shortlist]: {
      title: "Candidate Shortlist",
      description: "Rank and compare multiple GitHub profiles",
      badge: "For Recruiters",
      accentColor: "purple",
      breadcrumbs: [
        { label: "Home" },
        { label: "Recruiter Tools" },
        { label: "Shortlist", current: true },
      ],
      parent: routes.recruiters,
    },
    [routes.resumeGithub]: {
      title: "Resume vs GitHub Match",
      description: "Verify resume claims against actual repository work",
      badge: "For Recruiters",
      accentColor: "purple",
      breadcrumbs: [
        { label: "Home" },
        { label: "Recruiter Tools" },
        { label: "Resume Match", current: true },
      ],
      parent: routes.recruiters,
    },
    [routes.githubCompare]: {
      title: "GitHub Profile Compare",
      description: "Side-by-side comparison of two developers",
      badge: "For Recruiters",
      accentColor: "purple",
      breadcrumbs: [
        { label: "Home" },
        { label: "Recruiter Tools" },
        { label: "Compare", current: true },
      ],
      parent: routes.recruiters,
    },
  };

  return routeMap[currentRoute] || routeMap[routes.home];
}

/**
 * Generate breadcrumb items with navigation handlers
 */
export function getBreadcrumbItems(routeInfo, navigate) {
  if (!routeInfo?.breadcrumbs) return [];

  return routeInfo.breadcrumbs.map((crumb, index) => {
    const onClick = () => {
      if (index === 0) navigate(routes.home);
      else if (index === 1) {
        if (crumb.label === "Student Tools") navigate(routes.students);
        else if (crumb.label === "Recruiter Tools") navigate(routes.recruiters);
      }
    };

    return {
      ...crumb,
      onClick: !crumb.current ? onClick : undefined,
    };
  });
}

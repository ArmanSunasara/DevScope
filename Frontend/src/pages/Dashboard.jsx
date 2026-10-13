import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import HomePage from "./HomePage";
import CandidateShortlistPage from "./hr/CandidateShortlistPage";
import GithubProfileComparePage from "./hr/GithubProfileComparePage";
import RecruiterToolsPage from "./hr/RecruiterToolsPage";
import ResumeGithubMatchPage from "./hr/ResumeGithubMatchPage";
import AtsScorePage from "./student/AtsScorePage";
import SpecializationFitPage from "./student/SpecializationFitPage";
import StudentToolsPage from "./student/StudentToolsPage";
import { getCurrentRoute, routes } from "../routes";

function Dashboard() {
  const [route, setRoute] = useState(getCurrentRoute);

  useEffect(() => {
    const handlePopState = () => setRoute(getCurrentRoute());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = useCallback((path) => {
    window.history.pushState({}, "", path);
    setRoute(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Scroll to a landing section by id. When the user is on a tool page we
  // route home first, then scroll once the section has rendered.
  const scrollToSection = useCallback(
    (id) => {
      const scroll = () =>
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

      if (getCurrentRoute() !== routes.home) {
        navigate(routes.home);
        setTimeout(scroll, 120);
      } else {
        scroll();
      }
    },
    [navigate]
  );

  const renderPage = () => {
    switch (route) {
      case routes.students:
        return <StudentToolsPage navigate={navigate} />;
      case routes.ats:
        return <AtsScorePage navigate={navigate} />;
      case routes.specialization:
        return <SpecializationFitPage navigate={navigate} />;
      case routes.recruiters:
        return <RecruiterToolsPage navigate={navigate} />;
      case routes.shortlist:
        return <CandidateShortlistPage navigate={navigate} />;
      case routes.resumeGithub:
        return <ResumeGithubMatchPage navigate={navigate} />;
      case routes.githubCompare:
        return <GithubProfileComparePage navigate={navigate} />;
      case routes.home:
      default:
        return <HomePage navigate={navigate} scrollToSection={scrollToSection} />;
    }
  };

  const isHome = route === routes.home;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar navigate={navigate} scrollToSection={scrollToSection} />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {isHome ? (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderPage()}
            </motion.div>
          ) : (
            <motion.div
              key={route}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ 
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 md:py-14 lg:px-8"
            >
              {renderPage()}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer navigate={navigate} scrollToSection={scrollToSection} />
    </div>
  );
}

export default Dashboard;

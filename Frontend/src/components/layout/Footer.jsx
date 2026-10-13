import {
  FiGithub,
  FiTwitter,
  FiLinkedin,
  FiMail,
  FiArrowUp,
} from "react-icons/fi";
import Container from "../ui/Container";
import { routes } from "../../routes";

/**
 * Global footer: brand blurb, grouped navigation, social links and copyright.
 * Link actions reuse the SPA router (navigate) and scrollToSection helpers.
 */
function Footer({ navigate, scrollToSection }) {
  const year = new Date().getFullYear();

  const columns = [
    {
      title: "Product",
      links: [
        { label: "How It Works", action: () => scrollToSection("how-it-works") },
        { label: "Features", action: () => scrollToSection("features") },
        { label: "About", action: () => scrollToSection("about") },
      ],
    },
    {
      title: "For Students",
      links: [
        { label: "Student Tools", action: () => navigate(routes.students) },
        { label: "ATS Score", action: () => navigate(routes.ats) },
        { label: "Specialization Fit", action: () => navigate(routes.specialization) },
      ],
    },
    {
      title: "For Recruiters",
      links: [
        { label: "Recruiter Tools", action: () => navigate(routes.recruiters) },
        { label: "Candidate Shortlist", action: () => navigate(routes.shortlist) },
        { label: "Profile Compare", action: () => navigate(routes.githubCompare) },
      ],
    },
  ];

  const socials = [
    { label: "GitHub", icon: FiGithub, href: "https://github.com" },
    { label: "Twitter", icon: FiTwitter, href: "https://twitter.com" },
    { label: "LinkedIn", icon: FiLinkedin, href: "https://linkedin.com" },
    { label: "Email", icon: FiMail, href: "mailto:hello@example.com" },
  ];

  return (
    <footer className="relative mt-24 border-t border-slate-800/80 bg-slate-950/40">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <button
              type="button"
              onClick={() => navigate(routes.home)}
              className="group flex items-center gap-2.5 cursor-pointer"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-indigo-600/30">
                <FiGithub className="text-lg text-white" />
              </span>
              <span className="text-base font-bold tracking-tight text-white">
                Portfolio<span className="text-gradient">Analyzer</span>
              </span>
            </button>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              AI-powered, recruiter-style reviews of GitHub profiles. Get
              actionable feedback in under 60 seconds.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {socials.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 transition-all hover:-translate-y-0.5 hover:border-indigo-400/40 hover:text-white"
                >
                  <Icon className="text-base" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-white">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <button
                      type="button"
                      onClick={link.action}
                      className="text-sm text-slate-400 transition-colors hover:text-white cursor-pointer"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-6 sm:flex-row">
          <p className="text-sm text-slate-500">
            © {year} GitHub Portfolio Analyzer. All rights reserved.
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white cursor-pointer"
          >
            Back to top <FiArrowUp />
          </button>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;

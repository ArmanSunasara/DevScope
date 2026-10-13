import Container from "./ui/Container";

/**
 * Typography Showcase Component
 * 
 * This component demonstrates all available typography styles and effects.
 * Use it as a reference when building new components.
 * 
 * To view: Import and render in a page/route temporarily
 */
function TypographyShowcase() {
  return (
    <section className="py-20">
      <Container>
        <div className="space-y-16">
          {/* Display Text */}
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-4">
              Display Text (Extra Large)
            </p>
            <h1 className="display-text text-white">
              Display Headline
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              48px–112px • Weight 900 • Letter spacing -0.04em
            </p>
          </div>

          {/* Hero Text */}
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-4">
              Hero Text (Main Headlines)
            </p>
            <h1 className="hero-text text-white">
              See your GitHub the way a{" "}
              <span className="text-shimmer">recruiter does</span>
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              40px–88px • Weight 800 • Letter spacing -0.04em
            </p>
          </div>

          {/* Heading 1 */}
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-4">
              Heading 1 (Major Sections)
            </p>
            <h2 className="heading-1 text-white">
              Major Section Headline
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              32px–64px • Weight 700 • Letter spacing -0.02em
            </p>
          </div>

          {/* Heading 2 */}
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-4">
              Heading 2 (Section Headings)
            </p>
            <h2 className="heading-2 text-white">
              Standard Section Heading
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              28px–48px • Weight 700 • Letter spacing -0.02em
            </p>
          </div>

          {/* Heading 3 */}
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-4">
              Heading 3 (Sub-sections)
            </p>
            <h3 className="heading-3 text-white">
              Sub-section Heading
            </h3>
            <p className="text-sm text-slate-400 mt-2">
              24px–36px • Weight 600 • Letter spacing 0
            </p>
          </div>

          {/* Text Effects */}
          <div className="space-y-8">
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-4">
              Text Effects
            </p>
            
            {/* Shimmer */}
            <div>
              <h2 className="hero-text text-white">
                <span className="text-shimmer">Shimmer Effect</span>
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                Animated gradient shimmer • Best for hero highlights
              </p>
            </div>

            {/* Animated Gradient */}
            <div>
              <h2 className="hero-text text-white">
                <span className="text-gradient">Animated Gradient</span>
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                Smooth gradient animation • 8s loop
              </p>
            </div>

            {/* Static Gradient */}
            <div>
              <h2 className="hero-text text-white">
                <span className="text-gradient-static">Static Gradient</span>
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                Same gradient, no animation • Subtle emphasis
              </p>
            </div>
          </div>

          {/* Body Text Hierarchy */}
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-4">
              Body Text Sizes
            </p>
            
            <div>
              <p className="text-xl text-slate-300">
                Extra large body text (20px)
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Use for lead paragraphs
              </p>
            </div>

            <div>
              <p className="text-lg text-slate-400" style={{ lineHeight: 'var(--line-height-relaxed)' }}>
                Large body text (18px) with relaxed line-height. This is ideal for longer-form content where readability is paramount. The line-height of 1.625 provides comfortable reading flow.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Use for descriptions, intros
              </p>
            </div>

            <div>
              <p className="text-base text-slate-400">
                Base body text (16px) — standard paragraph text
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Default for most content
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Small text (14px) — secondary information
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Use for captions, metadata
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500" style={{ letterSpacing: 'var(--letter-spacing-wider)' }}>
                EXTRA SMALL (12PX) • ALL CAPS • LABELS
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Use for labels, badges, eyebrows
              </p>
            </div>
          </div>

          {/* Color Pairings */}
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-4">
              Color Pairings
            </p>
            
            <div className="space-y-3">
              <p className="text-white font-semibold">
                Primary (text-white) • Headlines, emphasis
              </p>
              <p className="text-slate-300">
                Light (text-slate-300) • Elevated body text
              </p>
              <p className="text-slate-400">
                Secondary (text-slate-400) • Standard body text
              </p>
              <p className="text-slate-500">
                Tertiary (text-slate-500) • De-emphasized text
              </p>
              <p className="text-indigo-300">
                Accent (text-indigo-300) • Interactive elements
              </p>
            </div>
          </div>

          {/* Combined Example */}
          <div className="glass rounded-3xl p-8 md:p-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-300">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              Example Section
            </span>

            <h2 className="heading-2 mt-6 text-white">
              Real-World Typography Example
            </h2>

            <p className="mt-4 text-lg text-slate-400" style={{ lineHeight: 'var(--line-height-relaxed)' }}>
              This demonstrates how typography works in an actual component. Notice the consistent spacing, readable line-height, and clear visual hierarchy. The eyebrow label uses uppercase with wider letter-spacing, the heading is bold with tight spacing, and the body text has relaxed line-height for comfortable reading.
            </p>

            <div className="mt-8 flex items-center gap-4">
              <div>
                <p className="text-3xl font-bold text-gradient">2.5s</p>
                <p className="text-sm text-slate-400">Load time</p>
              </div>
              <div className="h-12 w-px bg-slate-700" />
              <div>
                <p className="text-3xl font-bold text-white">100%</p>
                <p className="text-sm text-slate-400">Responsive</p>
              </div>
            </div>
          </div>

          {/* Usage Notes */}
          <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              📚 Usage Guidelines
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>✅ Use <code className="text-indigo-300">hero-text</code> for main landing page headlines</li>
              <li>✅ Use <code className="text-indigo-300">heading-2</code> for section titles</li>
              <li>✅ Use <code className="text-indigo-300">text-shimmer</code> for key hero highlights</li>
              <li>✅ Apply relaxed line-height to long-form content</li>
              <li>❌ Don't mix multiple gradient effects in one section</li>
              <li>❌ Don't use display-text for regular content (too large)</li>
              <li>❌ Don't override font weights inconsistently</li>
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default TypographyShowcase;

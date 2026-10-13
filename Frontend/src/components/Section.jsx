import { useScrollReveal } from "../hooks/useScrollReveal";

/**
 * Premium Section component with automatic scroll reveals
 * Provides consistent section styling and animations
 * 
 * Usage:
 * <Section id="features" className="py-20">
 *   <Container>
 *     <SectionHeading title="Features" />
 *     <div>Content</div>
 *   </Container>
 * </Section>
 */
function Section({ 
  id,
  children, 
  className = "",
  withDivider = false,
  animate = true,
  atmospheric = false,
  glowPosition = "center",
}) {
  const ref = useScrollReveal({ threshold: 0.05 });

  return (
    <section
      id={id}
      ref={animate ? ref : null}
      className={`relative ${animate ? 'section-flow animate-on-scroll' : ''} ${className}`}
    >
      {/* Atmospheric glow effect */}
      {atmospheric && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div 
            className={`absolute h-[500px] w-[700px] -translate-y-1/2 ${
              glowPosition === 'left' ? 'left-0 -translate-x-1/3' :
              glowPosition === 'right' ? 'right-0 translate-x-1/3' :
              'left-1/2 -translate-x-1/2'
            } top-1/2`}
            style={{
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.015) 0%, transparent 70%)',
              filter: 'blur(130px)',
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Bottom divider */}
      {withDivider && (
        <div className="absolute bottom-0 left-1/2 h-px w-3/4 max-w-3xl -translate-x-1/2 bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
      )}
    </section>
  );
}

export default Section;

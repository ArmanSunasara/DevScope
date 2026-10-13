/**
 * Centers content and applies the shared horizontal gutters used across every
 * section so the landing page lines up to a single grid.
 */
function Container({ as: Tag = "div", className = "", children, ...props }) {
  return (
    <Tag
      className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}

export default Container;

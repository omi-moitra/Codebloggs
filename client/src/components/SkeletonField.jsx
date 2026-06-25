// =============================================================================
// components/SkeletonField.jsx — Animated skeleton placeholder for form fields
// -----------------------------------------------------------------------------
// 1. SkeletonField   Renders a <div> with skeleton-bar + skeleton-bar--field;
//                    sits in place of a <Form.Control> while data is loading;
//                    accepts no props — size is controlled entirely by CSS
// =============================================================================

// Skeleton.css is already imported by SkeletonTable.jsx. Importing it here as
// well is safe — CSS modules de-duplicate; the styles are injected once.
import "./Skeleton.css";

// No props needed — the --field modifier on the CSS class sets full-width /
// input-height so it visually matches a Bootstrap Form.Control.
const SkeletonField = () => (
  <div className="skeleton-bar skeleton-bar--field" />
);

export default SkeletonField;

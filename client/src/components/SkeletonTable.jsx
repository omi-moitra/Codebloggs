// =============================================================================
// components/SkeletonTable.jsx — Animated skeleton <tbody> for loading states
// -----------------------------------------------------------------------------
// 1. SkeletonTable   Renders a <tbody> with `rows` SkeletonRow instances;
//                    accepts `rows` (how many placeholder rows) and `cols`
//                    (how many columns per row) as props
// =============================================================================

// Skeleton.css is imported here (not globally) so pulse styles are scoped to
// skeleton components and don't pollute the global stylesheet.
import "./Skeleton.css";
import SkeletonRow from "./SkeletonRow";

// `rows` defaults to 10 (the minimum pageSize) so callers that don't pass
// a value still get a full-height placeholder matching the default page size.
// Callers should pass the current `pageSize` so the skeleton matches
// the exact vertical footprint of a real data page — prevents layout shift.
const SkeletonTable = ({ rows = 10, cols, colWidths }) => (
  <tbody>
    {Array.from({ length: rows }, (_, i) => (
      <SkeletonRow key={i} cols={cols} colWidths={colWidths} />
    ))}
  </tbody>
);

import PropTypes from "prop-types";

SkeletonTable.propTypes = {
  rows: PropTypes.number,
  cols: PropTypes.number.isRequired,
  colWidths: PropTypes.arrayOf(PropTypes.string),
};

export default SkeletonTable;

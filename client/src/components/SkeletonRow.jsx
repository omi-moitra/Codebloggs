// =============================================================================
// components/SkeletonRow.jsx — Single animated skeleton table row
// -----------------------------------------------------------------------------
// 1. SkeletonRow   Renders one <tr> with `cols` <td> cells, each containing
//                  a .skeleton-bar div; accepts `cols` as a required prop
// =============================================================================

// SkeletonRow is intentionally generic — it knows nothing about users or posts.
// The parent passes `cols` to match the column count of any table it sits inside.
// .skeleton-cell sets the <td> height to match real rows driven by sm buttons.
const SkeletonRow = ({ cols, colWidths }) => (
  <tr>
    {Array.from({ length: cols }, (_, i) => (
      <td key={i} className="skeleton-cell">
        <div
          className="skeleton-bar"
          style={colWidths?.[i] ? { width: colWidths[i] } : undefined}
        />
      </td>
    ))}
  </tr>
);

import PropTypes from "prop-types";

SkeletonRow.propTypes = {
  cols: PropTypes.number.isRequired,
  colWidths: PropTypes.arrayOf(PropTypes.string),
};

export default SkeletonRow;

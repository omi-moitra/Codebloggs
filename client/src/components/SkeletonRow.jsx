// =============================================================================
// components/SkeletonRow.jsx — Single animated skeleton table row
// -----------------------------------------------------------------------------
// 1. SkeletonRow   Renders one <tr> with `cols` <td> cells, each containing
//                  a .skeleton-bar div; accepts `cols` as a required prop
// =============================================================================

// SkeletonRow is intentionally generic — it knows nothing about users or posts.
// The parent passes `cols` to match the column count of any table it sits inside.
const SkeletonRow = ({ cols }) => (
  <tr>
    {Array.from({ length: cols }, (_, i) => (
      <td key={i}>
        <div className="skeleton-bar" />
      </td>
    ))}
  </tr>
);

export default SkeletonRow;

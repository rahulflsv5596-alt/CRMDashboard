export default function MapPanel() {
  return (
    <section className="map-col">
      <div className="map-controls">
        <div className="map-mode" role="tablist">
          <button className="active" data-mode="total">Total Budget</button>
          <button data-mode="federal">Federal Share</button>
          <button data-mode="perCapita">Per Capita</button>
          <button data-mode="pctState">% of State</button>
          <button data-mode="growth">YoY Growth</button>
          <button data-mode="bridgePoor">Poor Bridges %</button>
          <button data-mode="coverage">Contact Coverage</button>
        </div>
        <div className="zoom-controls">
          <button className="zoom-back-btn" id="zoom-back" title="Back to US view">
            <svg
              viewBox="0 0 24 24"
              width="12"
              height="12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Back to US</span>
          </button>
          <div className="map-legend">
            <div>
              <div className="legend-bar" id="legend-bar"></div>
              <div className="legend-labels">
                <span id="legend-min">low</span>
                <span id="legend-max">high</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="map-wrap">
        <svg id="us-map" viewBox="0 0 975 610" preserveAspectRatio="xMidYMid meet"></svg>
        <div className="map-tooltip" id="map-tooltip"></div>
      </div>
      <div className="map-summary" id="map-summary">
        <div className="map-summary-cell">
          <div className="map-summary-cell-label" id="sum-label-1">Federal Funds</div>
          <div className="map-summary-cell-value" id="sum-val-1">—</div>
        </div>
        <div className="map-summary-cell">
          <div className="map-summary-cell-label" id="sum-label-2">Other State</div>
          <div className="map-summary-cell-value" id="sum-val-2">—</div>
        </div>
        <div className="map-summary-cell">
          <div className="map-summary-cell-label" id="sum-label-3">General Fund</div>
          <div className="map-summary-cell-value" id="sum-val-3">—</div>
        </div>
        <div className="map-summary-cell">
          <div className="map-summary-cell-label" id="sum-label-4">Bonds</div>
          <div className="map-summary-cell-value" id="sum-val-4">—</div>
        </div>
      </div>
    </section>
  );
}

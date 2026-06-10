export default function Footer({ full = true }) {
  return (
    <footer role="contentinfo" className="futuristic-footer">
      <div className="footer-shell">
        <div className="footer-brand">
          <div className="ft-logo">
            Daniel<em>Gadgets</em>
          </div>
          <p className="ft-tag">&quot;Premium Technology. Trusted Services.&quot;</p>
        </div>
        {full && (
          <>
            <div className="footer-badges">
              <span>Official Retailer</span>
              <span>Authentic Only</span>
              <span>24-Hour Delivery</span>
            </div>
            <div className="footer-status">
              <span className="status-dot"></span> System Operational
            </div>
          </>
        )}
      </div>
      <p className="ft-copy">© 2026 Daniel Gadgets. All Rights Reserved.</p>
    </footer>
  );
}

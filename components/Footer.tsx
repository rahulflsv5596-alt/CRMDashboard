export default function Footer() {
  return (
    <footer className="footer">
      <div>
        SOURCES:{' '}
        <a
          href="https://higherlogicdownload.s3.amazonaws.com/NASBO/9d2d2db1-c943-4f1b-b750-0fca152d64c2/UploadedImages/SER%20Archive/2025_SER/Transportation_Tables_2025_State_Expenditure_Report.pdf"
          target="_blank"
          rel="noopener"
        >
          NASBO 2025
        </a>{' '}
        ·{' '}
        <a
          href="https://www.fhwa.dot.gov/policyinformation/statistics/2023/sf21.cfm"
          target="_blank"
          rel="noopener"
        >
          FHWA SF-21
        </a>{' '}
        ·{' '}
        <a
          href="https://www.fhwa.dot.gov/Bridge/nbi/no10/condition24.cfm"
          target="_blank"
          rel="noopener"
        >
          NBI 2024
        </a>{' '}
        ·{' '}
        <a
          href="https://www.census.gov/geographies/mapping-files.html"
          target="_blank"
          rel="noopener"
        >
          Census TIGER
        </a>{' '}
        ·{' '}
        <a
          href="https://transportation.org/meetings/membership-state-by-state/"
          target="_blank"
          rel="noopener"
        >
          AASHTO
        </a>
      </div>
      <div>
        An <span>interactive</span> aggregation of public data.
      </div>
    </footer>
  );
}

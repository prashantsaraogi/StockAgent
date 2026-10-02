const DISCLAIMER =
  'Disclaimer: Investments are subject to market risks. Please consult your financial advisor before making any investment decisions. This Stock Investment Playbook is based on multiple assumptions, analyses, and perspectives and is intended for informational purposes only.';

export function DisclaimerBanner() {
  return (
    <div className="disclaimer-banner" role="note" aria-label="Investment disclaimer">
      <div className="disclaimer-track">
        <span className="disclaimer-text">{DISCLAIMER}</span>
        <span className="disclaimer-text" aria-hidden="true">
          {DISCLAIMER}
        </span>
      </div>
    </div>
  );
}

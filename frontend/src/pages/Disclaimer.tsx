import { Helmet } from 'react-helmet-async';

export default function Disclaimer() {
  return (
    <div className="static-page">
      <Helmet>
        <title>Financial Disclaimer | GoFact</title>
        <meta name="description" content="Legal and financial disclaimer regarding aggregated content on GoFact." />
      </Helmet>

      <div className="static-doc-header">
        <div className="doc-meta"><strong>DOCUMENT ID</strong> DT-DSC-001</div>
        <div className="doc-meta"><strong>SUBJECT</strong> FINANCIAL DISCLAIMER</div>
        <div className="doc-meta"><strong>LAST UPDATED</strong> OCT 2026</div>
      </div>

      <div className="static-doc-content">
        <h2>1. Informational Purposes Only</h2>
        <p>
          The material presented on GoFact (www.gofact.in) is synthesized through automated data pipelines and AI summarization models strictly for general information and educational awareness. None of the content constitutes individualized investment advice, securities recommendations, or financial counseling.
        </p>
        
        <h2>2. Data Accuracy & Completeness</h2>
        <p>
          Market conditions fluctuate rapidly. While we source data from reputable public wire services, GoFact does not guarantee the absolute timeliness, accuracy, or completeness of stock quotes, earnings projections, or regulatory summaries.
        </p>
        
        <h2>3. Investment Risk</h2>
        <p>
          Trading equities, options, indices, commodities, and digital currencies involves substantial risk of capital loss. Readers must consult registered financial advisors before executing any financial transaction based on topics discussed herein.
        </p>
        
        <h2>4. Third-Party Advertising</h2>
        <p>
          GoFact displays advertisements provided by Google AdSense and other advertising networks. We do not evaluate or endorse any product, platform, or brokerage service advertised on the platform.
        </p>
      </div>
    </div>
  );
}

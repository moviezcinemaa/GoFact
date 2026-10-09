import { Helmet } from 'react-helmet-async';

export default function Disclaimer() {
  return (
    <div className="max-w-4xl mx-auto p-6 mb-12">
      <Helmet>
        <title>Financial Disclaimer | GoFact</title>
        <meta name="description" content="Legal and financial disclaimer regarding aggregated content on GoFact." />
      </Helmet>

      <div className="bg-gray-50 border border-gray-300 p-8 rounded-none">
        <h1 className="text-2xl font-bold font-serif mb-6 border-b border-black pb-4">Financial Disclaimer</h1>
        
        <div className="space-y-6 text-sm text-black">
          <p>
            <strong>1. Informational Purposes Only:</strong> The material presented on GoFact (www.gofact.in) is synthesized through automated data pipelines and AI summarization models strictly for general information and educational awareness. None of the content constitutes individualized investment advice, securities recommendations, or financial counseling.
          </p>
          <p>
            <strong>2. Data Accuracy & Completeness:</strong> Market conditions fluctuate rapidly. While we source data from reputable public wire services, GoFact does not guarantee the absolute timeliness, accuracy, or completeness of stock quotes, earnings projections, or regulatory summaries.
          </p>
          <p>
            <strong>3. Investment Risk:</strong> Trading equities, options, indices, commodities, and digital currencies involves substantial risk of capital loss. Readers must consult registered financial advisors before executing any financial transaction based on topics discussed herein.
          </p>
          <p>
            <strong>4. Third-Party Advertising:</strong> GoFact displays advertisements provided by Google AdSense and other advertising networks. We do not evaluate or endorse any product, platform, or brokerage service advertised on the platform.
          </p>
        </div>
      </div>
    </div>
  );
}

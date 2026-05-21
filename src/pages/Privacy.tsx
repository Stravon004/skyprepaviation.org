import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-32 pb-24">
        <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-slate-500 text-sm mb-12">Last updated: May 21, 2026</p>

        <div className="space-y-10 text-slate-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
            <p>We collect the following information when you use SkyPrep:</p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-slate-400">
              <li><strong className="text-slate-300">Account information:</strong> Name and email address when you register.</li>
              <li><strong className="text-slate-300">Usage data:</strong> Exam sessions, scores, answers, and flashcard review history to power your progress tracking.</li>
              <li><strong className="text-slate-300">Payment information:</strong> Billing is handled entirely by Stripe. We store only a Stripe customer ID — we never see or store your full card number.</li>
              <li><strong className="text-slate-300">AI conversation data:</strong> Messages sent to the oral simulator are processed by Anthropic's Claude API to generate responses. These are not stored permanently after the session ends.</li>
              <li><strong className="text-slate-300">Technical data:</strong> Browser type, IP address, and usage logs for security and performance monitoring.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside mt-3 space-y-2 text-slate-400">
              <li>To provide and improve the Service</li>
              <li>To display your progress, scores, and study history</li>
              <li>To process payments and manage your subscription</li>
              <li>To send transactional emails (receipts, password resets)</li>
              <li>To detect and prevent fraud or abuse</li>
            </ul>
            <p className="mt-3">We do not sell your personal data. We do not use your data to train AI models.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Third-Party Services</h2>
            <p>We use the following third-party services, each with their own privacy policies:</p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-slate-400">
              <li><strong className="text-slate-300">Supabase</strong> — database and authentication hosting</li>
              <li><strong className="text-slate-300">Stripe</strong> — payment processing and subscription management</li>
              <li><strong className="text-slate-300">Anthropic</strong> — AI language model powering the oral simulator</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Data Retention</h2>
            <p>We retain your account data for as long as your account is active. Exam session data is retained indefinitely so you can review your history. You may request deletion of your account and associated data at any time by emailing <a href="mailto:support@skyprep.app" className="text-sky-400 hover:text-sky-300">support@skyprep.app</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Cookies</h2>
            <p>We use session cookies and local storage to keep you signed in. We do not use third-party tracking or advertising cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Security</h2>
            <p>All data is transmitted over HTTPS. Passwords are hashed and never stored in plain text. We use Supabase's Row-Level Security to ensure each user can only access their own data.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Children's Privacy</h2>
            <p>SkyPrep is not intended for children under 13. We do not knowingly collect data from children under 13. If you believe a child has provided us with personal information, contact us and we will delete it.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Your Rights</h2>
            <p>Depending on your location, you may have the right to access, correct, or delete your personal data. To exercise these rights, contact us at <a href="mailto:support@skyprep.app" className="text-sky-400 hover:text-sky-300">support@skyprep.app</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Changes to This Policy</h2>
            <p>We may update this policy as the Service evolves. We'll notify you of significant changes by email or in-app notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Contact</h2>
            <p>Privacy questions? Email <a href="mailto:support@skyprep.app" className="text-sky-400 hover:text-sky-300">support@skyprep.app</a>.</p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-800 flex gap-6 text-sm text-slate-500">
          <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
          <Link to="/" className="hover:text-slate-300 transition-colors">Back to Home</Link>
        </div>
      </div>
    </div>
  )
}

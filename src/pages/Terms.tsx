import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-32 pb-24">
        <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-slate-500 text-sm mb-12">Last updated: May 21, 2026</p>

        <div className="prose-sky space-y-10 text-slate-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using SkyPrep ("Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. These terms apply to all visitors, users, and subscribers.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
            <p>SkyPrep is an educational platform designed to help student pilots prepare for FAA written knowledge tests and oral checkrides. The Service provides practice questions, flashcards, and AI-assisted oral exam simulation for informational and educational purposes only.</p>
            <p className="mt-3 text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-sm">
              <strong>Important:</strong> SkyPrep is a study aid only. It does not replace official FAA publications, certified flight instruction, or regulatory guidance. Always consult current FAA materials (AIM, FARs, AFDs) for authoritative information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Account Registration</h2>
            <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your credentials and for all activity under your account. Notify us immediately of any unauthorized use at support@skyprep.app.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Subscriptions and Billing</h2>
            <p>Paid plans are billed monthly on a recurring basis via Stripe. You authorize us to charge your payment method on each billing cycle. Subscriptions renew automatically unless cancelled before the renewal date.</p>
            <ul className="list-disc list-inside mt-3 space-y-1 text-slate-400">
              <li>You may cancel your subscription at any time through the billing portal.</li>
              <li>Cancellation takes effect at the end of the current billing period.</li>
              <li>We offer a 7-day money-back guarantee for new subscriptions. Contact support to request a refund within 7 days of your first charge.</li>
              <li>We reserve the right to change pricing with 30 days' notice.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside mt-3 space-y-1 text-slate-400">
              <li>Share, resell, or redistribute SkyPrep content or question banks</li>
              <li>Attempt to reverse-engineer, scrape, or extract question data in bulk</li>
              <li>Use the Service for any unlawful purpose</li>
              <li>Circumvent access controls or attempt to access accounts that are not yours</li>
              <li>Interfere with the integrity or performance of the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Intellectual Property</h2>
            <p>All content on SkyPrep, including questions, explanations, and software, is owned by SkyPrep or its licensors and is protected by copyright law. FAA question data is sourced from publicly available government test banks. Your account data belongs to you.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Disclaimer of Warranties</h2>
            <p>The Service is provided "as is" without warranties of any kind. We do not warrant that the Service will be uninterrupted, error-free, or that question content will always reflect the most current FAA test standards. Always verify with official FAA sources before your exam.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, SkyPrep shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including but not limited to exam failures or flight training outcomes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Termination</h2>
            <p>We may suspend or terminate your account at any time for violation of these terms. You may delete your account at any time by contacting us. Upon termination, your access to paid features will cease at the end of the current billing period.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Changes to Terms</h2>
            <p>We may update these terms from time to time. We will notify you of material changes by email or through the Service. Continued use after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Contact</h2>
            <p>Questions about these terms? Email <a href="mailto:support@skyprep.app" className="text-sky-400 hover:text-sky-300">support@skyprep.app</a>.</p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-800 flex gap-6 text-sm text-slate-500">
          <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
          <Link to="/" className="hover:text-slate-300 transition-colors">Back to Home</Link>
        </div>
      </div>
    </div>
  )
}

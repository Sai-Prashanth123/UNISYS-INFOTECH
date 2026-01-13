import React from 'react';
import { Shield } from 'lucide-react';

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] text-white">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-10 h-10 text-blue-400" />
          <h1 className="text-4xl md:text-5xl font-bold">Privacy Policy</h1>
        </div>
        
        <div className="space-y-8 text-slate-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
            <p className="leading-relaxed">
              We collect information that you provide directly to us, including name, email address, phone number, 
              and any other information you choose to provide when using our services or contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
            <p className="leading-relaxed mb-3">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Send you technical notices and support messages</li>
              <li>Communicate with you about products, services, and events</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Information Sharing</h2>
            <p className="leading-relaxed">
              We do not sell, trade, or rent your personal information to third parties. We may share your 
              information only with your consent or as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
            <p className="leading-relaxed">
              We implement appropriate security measures to protect your personal information. However, no method 
              of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Your Rights</h2>
            <p className="leading-relaxed">
              You have the right to access, update, or delete your personal information. Contact us at 
              info@unisysinfotech.com to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Changes to This Policy</h2>
            <p className="leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
              the new policy on this page with an updated effective date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Contact Us</h2>
            <p className="leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at:
              <br />
              <strong className="text-white">Email:</strong> info@unisysinfotech.com
              <br />
              <strong className="text-white">Address:</strong> 20830 Torrence Chapel Rd Ste 203, Cornelius, NC 28031
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-slate-700">
            <p className="text-sm text-slate-400">
              <strong>Effective Date:</strong> January 1, 2025
              <br />
              <strong>Last Updated:</strong> December 31, 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

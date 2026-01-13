import React from 'react';
import { FileCheck } from 'lucide-react';

export const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] text-white">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="flex items-center gap-3 mb-8">
          <FileCheck className="w-10 h-10 text-blue-400" />
          <h1 className="text-4xl md:text-5xl font-bold">Terms & Conditions</h1>
        </div>
        
        <div className="space-y-8 text-slate-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing and using UNISYS INFOTECH services, you accept and agree to be bound by the terms 
              and provisions of this agreement. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Use of Services</h2>
            <p className="leading-relaxed mb-3">You agree to use our services only for lawful purposes and in accordance with these Terms. You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Use our services in any way that violates applicable laws or regulations</li>
              <li>Engage in any conduct that restricts or inhibits anyone's use of the services</li>
              <li>Attempt to gain unauthorized access to any portion of the services</li>
              <li>Use any automated system to access the services in a manner that sends more requests than a human can reasonably produce</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Intellectual Property</h2>
            <p className="leading-relaxed">
              The services and their entire contents, features, and functionality are owned by UNISYS INFOTECH 
              and are protected by copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Service Availability</h2>
            <p className="leading-relaxed">
              We strive to provide uninterrupted access to our services, but we do not guarantee that our services 
              will be available at all times. We may suspend or withdraw services without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Limitation of Liability</h2>
            <p className="leading-relaxed">
              UNISYS INFOTECH shall not be liable for any indirect, incidental, special, consequential, or punitive 
              damages resulting from your use of or inability to use the services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Indemnification</h2>
            <p className="leading-relaxed">
              You agree to indemnify and hold UNISYS INFOTECH harmless from any claims, damages, losses, liabilities, 
              and expenses arising from your use of the services or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Changes to Terms</h2>
            <p className="leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of any material changes 
              by posting the new Terms on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Governing Law</h2>
            <p className="leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the State of North Carolina, 
              without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Contact Information</h2>
            <p className="leading-relaxed">
              For questions about these Terms, please contact us at:
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

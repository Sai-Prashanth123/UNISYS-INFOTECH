import React from 'react';
import { Lock } from 'lucide-react';

export const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] text-white">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="flex items-center gap-3 mb-8">
          <Lock className="w-10 h-10 text-blue-400" />
          <h1 className="text-4xl md:text-5xl font-bold">Cookie Policy</h1>
        </div>
        
        <div className="space-y-8 text-slate-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. What Are Cookies</h2>
            <p className="leading-relaxed">
              Cookies are small text files that are placed on your device when you visit our website. They help us 
              provide you with a better experience by remembering your preferences and understanding how you use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Types of Cookies We Use</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Essential Cookies</h3>
                <p className="leading-relaxed">
                  These cookies are necessary for the website to function properly. They enable core functionality 
                  such as security, authentication, and accessibility.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Preference Cookies</h3>
                <p className="leading-relaxed">
                  These cookies allow our website to remember choices you make (such as theme preferences) and 
                  provide enhanced, personalized features.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Analytics Cookies</h3>
                <p className="leading-relaxed">
                  These cookies help us understand how visitors interact with our website by collecting and 
                  reporting information anonymously.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Cookies</h2>
            <p className="leading-relaxed mb-3">We use cookies to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Keep you signed in to your account</li>
              <li>Remember your preferences and settings</li>
              <li>Understand how you use our services</li>
              <li>Improve our website performance and user experience</li>
              <li>Provide secure access to protected areas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Managing Cookies</h2>
            <p className="leading-relaxed">
              Most web browsers allow you to control cookies through their settings. You can set your browser to 
              refuse cookies or delete certain cookies. However, if you disable cookies, some features of our 
              website may not function properly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Third-Party Cookies</h2>
            <p className="leading-relaxed">
              We may use third-party services that also set cookies on your device. These third parties have their 
              own privacy policies, and we have no control over their cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Updates to This Policy</h2>
            <p className="leading-relaxed">
              We may update this Cookie Policy from time to time. Any changes will be posted on this page with 
              an updated effective date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Contact Us</h2>
            <p className="leading-relaxed">
              If you have questions about our use of cookies, please contact us at:
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

'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-black mb-6">Accessibility Statement</h1>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            StoryVault is committed to digital accessibility for individuals with diverse abilities. We adhere to WCAG 2.1 AA standards across mobile, tablet, and desktop interfaces.
          </p>

          <section className="space-y-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Accessibility Features Built-In:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Reading Customization:</strong> Adjustable font sizes (14px to 26px) and high-contrast Light, Dark, and warm Sepia reading backgrounds.</li>
              <li><strong>Typography Selection:</strong> High-legibility Serif and Sans-serif typefaces.</li>
              <li><strong>Screen Reader Navigation:</strong> Semantic HTML landmarks and ARIA attributes for seamless screen reading.</li>
            </ul>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

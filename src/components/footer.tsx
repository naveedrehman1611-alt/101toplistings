import type { ChromeVM } from '@/lib/home-types';

// STUB — replaced by the footer implementation.
export function Footer({ chrome }: { chrome: ChromeVM }) {
  return (
    <footer className="bg-navy-900 text-white">
      <div className="container-page py-8">
        © {new Date().getFullYear()} {chrome.footer.copyright}
      </div>
    </footer>
  );
}

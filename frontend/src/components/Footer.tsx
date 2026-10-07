export function Footer() {
  return (
    <footer className="mt-16 border-t border-forest-100 bg-forest-900 text-forest-100">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <h3 className="text-lg font-semibold text-white">AyurSethu</h3>
          <p className="mt-2 text-sm text-forest-300">
            Connecting patients, BAMS students, doctors and verified Ayurvedic pharmacies on one platform.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Contact</h4>
          <p className="mt-2 text-sm text-forest-300">support@ayursethu.demo</p>
          <p className="text-sm text-forest-300">+91-00000-00000 (demo)</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Legal</h4>
          <p className="mt-2 text-sm text-forest-300">
            Educational information only. Not a substitute for professional medical advice, diagnosis or treatment.
          </p>
        </div>
      </div>
      <div className="border-t border-forest-800 py-4 text-center text-xs text-forest-400">
        © {new Date().getFullYear()} AyurSethu (demo build). All product and pharmacy data in this build is for demonstration only.
      </div>
    </footer>
  );
}

import { Stethoscope } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <Stethoscope size={16} />
            </div>
            <span className="text-sm font-semibold text-gray-900">
              Digi<span className="text-primary">Doc</span>
            </span>
          </div>
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} DigiDoc. This is not a substitute
            for professional medical advice. If you are experiencing a medical
            emergency, please call <strong>999 / 112</strong>.
          </p>
        </div>
      </div>
    </footer>
  );
}

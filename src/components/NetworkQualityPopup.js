import { Transition } from "@headlessui/react";
import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment, useState, useEffect } from "react";

const LIMITATION_CONTENT = {
  bandwidth: {
    title: "Low Bandwidth",
    message: "Your network bandwidth is low. Video and audio quality may drop.",
  },
  cpu: {
    title: "High CPU Usage",
    message: "High CPU usage detected. Your device may be struggling.",
  },
};

const ALL_TYPES = ["bandwidth", "cpu"];

const NetworkQualityPopup = ({ limitations }) => {
  const [dismissed, setDismissed] = useState({});

  // Clear dismissed state when the limitation resolves so it can re-appear
  useEffect(() => {
    if (!limitations) return;
    setDismissed((prev) => {
      const next = { ...prev };
      for (const type of ALL_TYPES) {
        if (!limitations[type]) delete next[type];
      }
      return next;
    });
  }, [limitations]);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {ALL_TYPES.map((type) => {
        const isActive = !!(limitations && limitations[type]);
        const isShow = isActive && !dismissed[type];
        const content = LIMITATION_CONTENT[type] ?? { title: "Network Issue", message: "Connection is not stable." };

        return (
          <Transition
            key={type}
            show={isShow}
            appear
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-x-4 opacity-0"
            enterTo="translate-x-0 opacity-100"
            leave="transition ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0 translate-x-4"
          >
            <div className="pointer-events-auto w-72 rounded-2xl bg-white border border-brand-border-light shadow-[0_8px_24px_rgba(0,0,0,0.10)] p-4">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="shrink-0 w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center mt-0.5">
                  <ExclamationTriangleIcon className="h-4 w-4 text-amber-500" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-brand-text font-poppins leading-tight">
                    {content.title}
                  </p>
                  <p className="mt-1 text-xs text-brand-text-muted font-poppins leading-snug">
                    {content.message}
                  </p>
                </div>

                {/* Close */}
                <button
                  onClick={() => setDismissed((prev) => ({ ...prev, [type]: true }))}
                  className="shrink-0 -mt-0.5 -mr-0.5 p-1.5 rounded-lg text-brand-text-faint hover:text-brand-text hover:bg-brand-bg-input transition-colors"
                  aria-label="Dismiss"
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </Transition>
        );
      })}
    </div>
  );
};

export default NetworkQualityPopup;

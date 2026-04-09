import { Transition } from "@headlessui/react";
import { Fragment } from "react";

const getLimitationContent = (type) => {
  if (type === "bandwidth")
    return {
      title: "Low Bandwidth",
      message: "Your network bandwidth is low. Video and audio quality may drop.",
    };
  if (type === "congestion")
    return {
      title: "Network Congestion",
      message: "Network congestion detected. You may experience lag or delays.",
    };
  if (type === "cpu")
    return {
      title: "High CPU Usage",
      message: "High CPU usage detected. Your device may be struggling.",
    };
  return { title: "Network Issue", message: "Connection is not stable." };
};

const NetworkQualityPopup = ({ limitations }) => {
  const allTypes = ["bandwidth", "congestion", "cpu"];

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3">
      {allTypes.map((type) => {
        const isShow = !!(limitations && limitations[type]);
        const { title, message } = getLimitationContent(type);

        return (
          <Transition
            key={type}
            show={isShow}
            appear={true}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="w-80 max-w-sm rounded-lg bg-gray-750 p-4 shadow-2xl border border-gray-600 ring-1 ring-black ring-opacity-5">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="mt-0.5 h-6 w-6 text-yellow-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-white">{title}</p>
                  <p className="mt-1 text-sm text-[#9FA0A7] leading-tight">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </Transition>
        );
      })}
    </div>
  );
};

export default NetworkQualityPopup;

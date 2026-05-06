import { Transition } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
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
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
      {allTypes.map((type) => {
        const isShow = !!(limitations && limitations[type]);
        const { title, message } = getLimitationContent(type);

        return (
          <Transition
            key={type}
            show={isShow}
            appear
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="w-80 max-w-sm rounded-xl bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-[#EEEEEE]">
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1B1C27] font-poppins">{title}</p>
                  <p className="mt-0.5 text-xs text-[#888888] font-poppins leading-snug">{message}</p>
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

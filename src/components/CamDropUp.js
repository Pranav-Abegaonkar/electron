import React from "react";
import { Popover, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";
import WebcamOnIcon from "../icons/Bottombar/WebcamOnIcon";
import WebcamOffIcon from "../icons/WebcamOffIcon";
import CameraPermissionDenied from "../icons/CameraPermissionDenied";
import { useMeetingAppContext } from "../MeetingAppContextDef";

export default function CamDropUp({
  webcamOn,
  onToggle,
  webcams,
  changeWebcam,
  isCameraPermissionAllowed,
  openUpward = false,
}) {
  const { selectedWebcam, setSelectedWebcam } = useMeetingAppContext();

  if (!isCameraPermissionAllowed) {
    return <CameraPermissionDenied />;
  }

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          {/* Drop-up panel */}
          <Transition
            as={Fragment}
            enter="transition ease-out duration-150"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className={`absolute ${openUpward ? "bottom-full mb-3" : "top-full mt-3"} left-1/2 -translate-x-1/2 z-30 w-60`}>
              <div className="bg-white border border-[#EEEEEE] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.12)] py-2">
                <p className="text-[10px] font-bold text-[#888CC4] font-poppins px-4 pt-1 pb-1.5 uppercase tracking-widest">
                  Camera
                </p>
                {webcams.map((cam) => (
                  <button
                    key={cam.deviceId}
                    onClick={() => {
                      setSelectedWebcam({ id: cam.deviceId, label: cam.label });
                      changeWebcam(cam.deviceId);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-[#F5F6FF] text-sm text-[#1B1C27] font-poppins text-left transition-colors"
                  >
                    <CheckIcon
                      className={`w-4 h-4 shrink-0 text-[#888CC4] ${
                        selectedWebcam?.id === cam.deviceId ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <span className="truncate">{cam.label || `Camera ${cam.deviceId}`}</span>
                  </button>
                ))}
              </div>
            </Popover.Panel>
          </Transition>

          {/* Split button */}
          <div
            className={`flex items-center rounded-lg overflow-hidden border transition-colors ${
              webcamOn ? "bg-white border-[#888CC4]" : "bg-red-500 border-red-500"
            }`}
          >
            {/* Toggle half */}
            <button
              onClick={onToggle}
              className="p-3 flex items-center justify-center"
              aria-label={webcamOn ? "Turn off camera" : "Turn on camera"}
            >
              {webcamOn ? <WebcamOnIcon fillcolor="#1B1C27" /> : <WebcamOffIcon fillcolor="#fff" />}
            </button>

            {/* Chevron half */}
            <Popover.Button
              className="px-1.5 py-3 flex items-center justify-center focus:outline-none"
              aria-label="Select camera"
            >
              <ChevronDownIcon
                className={`w-3.5 h-3.5 transition-transform ${
                  open ? "rotate-180" : ""
                } ${webcamOn ? "text-[#888CC4]" : "text-red-200"}`}
              />
            </Popover.Button>
          </div>
        </>
      )}
    </Popover>
  );
}

import React from "react";
import { Popover, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { CheckIcon } from "@heroicons/react/24/outline";
import VirtualBackgroundIcon from "../icons/Bottombar/VirtualBackgroundIcon";

export default function VBDropUp({
  vbOn,
  onToggle,
  backgroundImages,
  activeVBIndex,
  handleSelectBackground,
  openUpward = false,
}) {
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
            <Popover.Panel className={`absolute ${openUpward ? "bottom-full mb-3" : "top-full mt-3"} left-1/2 -translate-x-1/2 z-30 w-72`}>
              <div className="bg-white border border-[#EEEEEE] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.12)] p-2">
                <p className="text-[10px] font-bold text-[#888CC4] font-poppins px-2 pt-1 pb-2 uppercase tracking-widest">
                  Virtual Background
                </p>
                <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-60 px-2 pb-2">
                  {backgroundImages.map(({ previewImageUrl, backgroudImageUrl, type }, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectBackground({ type, backgroudImageUrl }, i)}
                      className={`relative aspect-video rounded-lg overflow-hidden transition-all
                        ${activeVBIndex === i
                          ? "ring-2 ring-[#888CC4] ring-offset-1"
                          : "opacity-75 hover:opacity-100"
                        }`}
                    >
                      <img
                        src={previewImageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      {activeVBIndex === i && (
                        <div className="absolute inset-0 bg-[#888CC4]/25 flex items-center justify-center">
                          <CheckIcon className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </Popover.Panel>
          </Transition>

          {/* Main button */}
          <Popover.Button
            className={`flex items-center rounded-lg overflow-hidden border transition-colors focus:outline-none ${vbOn ? "bg-white border-[#888CC4]" : "bg-white border-[#EEEEEE]"
              }`}
            aria-label="Select virtual background"
          >
            <div className="p-2 flex items-center justify-center">
              <VirtualBackgroundIcon fillcolor="#1B1C27" />
            </div>
          </Popover.Button>
        </>
      )}
    </Popover>
  );
}

import React from "react";
import { Popover, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";
import MicOnIcon from "../icons/Bottombar/MicOnIcon";
import MicOffIcon from "../icons/MicOffIcon";
import MicPermissionDenied from "../icons/MicPermissionDenied";
import { useMeetingAppContext } from "../MeetingAppContextDef";

export default function MicDropUp({
  micOn,
  onToggle,
  mics,
  speakers,
  changeMic,
  isMicrophonePermissionAllowed,
  openUpward = false,
}) {
  const { selectedMic, setSelectedMic, selectedSpeaker, setSelectedSpeaker } =
    useMeetingAppContext();

  if (!isMicrophonePermissionAllowed) {
    return <MicPermissionDenied />;
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
                {mics.length > 0 && (
                  <>
                    <p className="text-[10px] font-bold text-[#888CC4] font-poppins px-4 pt-1 pb-1.5 uppercase tracking-widest">
                      Microphone
                    </p>
                    {mics.map((mic) => (
                      <button
                        key={mic.deviceId}
                        onClick={() => {
                          setSelectedMic({ id: mic.deviceId, label: mic.label });
                          changeMic(mic.deviceId);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-[#F5F6FF] text-sm text-[#1B1C27] font-poppins text-left transition-colors"
                      >
                        <CheckIcon
                          className={`w-4 h-4 shrink-0 text-[#888CC4] ${selectedMic?.id === mic.deviceId ? "opacity-100" : "opacity-0"
                            }`}
                        />
                        <span className="truncate">{mic.label || `Microphone ${mic.deviceId}`}</span>
                      </button>
                    ))}
                  </>
                )}

                {speakers.length > 0 && (
                  <>
                    <div className="my-2 mx-4 h-px bg-[#EEEEEE]" />
                    <p className="text-[10px] font-bold text-[#888CC4] font-poppins px-4 pb-1.5 uppercase tracking-widest">
                      Speaker
                    </p>
                    {speakers.map((spk) => (
                      <button
                        key={spk.deviceId}
                        onClick={() =>
                          setSelectedSpeaker({ id: spk.deviceId, label: spk.label })
                        }
                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-[#F5F6FF] text-sm text-[#1B1C27] font-poppins text-left transition-colors"
                      >
                        <CheckIcon
                          className={`w-4 h-4 shrink-0 text-[#888CC4] ${selectedSpeaker?.id === spk.deviceId ? "opacity-100" : "opacity-0"
                            }`}
                        />
                        <span className="truncate">{spk.label || `Speaker ${spk.deviceId}`}</span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            </Popover.Panel>
          </Transition>

          {/* Split button */}
          <div
            className={`flex items-center rounded-lg overflow-hidden border transition-colors ${micOn ? "bg-white border-[#888CC4]" : "bg-red-500 border-red-500"
              }`}
          >
            {/* Toggle half */}
            <button
              onClick={onToggle}
              className="p-2 flex items-center justify-center"
              aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
            >
              {micOn ? <MicOnIcon fillcolor="#1B1C27" /> : <MicOffIcon fillcolor="#fff" />}
            </button>

            {/* Chevron half */}
            <Popover.Button
              className="px-1.5 py-3 flex items-center justify-center focus:outline-none"
              aria-label="Select microphone"
            >
              <ChevronDownIcon
                className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""
                  } ${micOn ? "text-[#888CC4]" : "text-red-200"}`}
              />
            </Popover.Button>
          </div>
        </>
      )}
    </Popover>
  );
}

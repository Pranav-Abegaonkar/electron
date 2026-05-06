import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

const ParticipantLeftModal = ({ open, onEndCall, participantName }) => {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onEndCall}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#1B1C27] opacity-40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-[#EEEEEE] transition-all">
                <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-[#1B1C27] font-poppins text-center">
                  Participant Left
                </Dialog.Title>
                <div className="mt-3 text-center">
                  <p className="text-sm text-[#888888] font-poppins leading-snug">
                    {participantName ? participantName : "The remote participant"} has disconnected and wasn&apos;t able to rejoin within the 55 second window.
                  </p>
                </div>
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    className="rounded-lg bg-red-500 hover:bg-red-600 px-6 py-2.5 text-sm font-semibold font-poppins text-white transition-colors focus:outline-none"
                    onClick={onEndCall}
                  >
                    End Call
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ParticipantLeftModal;

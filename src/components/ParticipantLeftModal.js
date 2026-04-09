import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

const ParticipantLeftModal = ({
  open,
  onEndCall,
  participantName,
}) => {
  return (
    <>
      <Transition appear show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onEndCall}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded bg-gray-750 p-6 text-left align-middle shadow-xl transition-all border border-gray-600">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white text-center">
                    Participant Left
                  </Dialog.Title>
                  <div className="mt-2 text-center">
                    <p className="text-sm text-[#9FA0A7]">
                      {participantName ? participantName : "The remote participant"} has disconnected and wasn't able to rejoin within the 55 second window.
                    </p>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <button
                      type="button"
                      className="rounded bg-[#FF5D5D] px-6 py-2.5 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 transition-colors"
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
    </>
  );
};

export default ParticipantLeftModal;

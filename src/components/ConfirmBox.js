import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

const ConfirmBox = ({
  successText,
  rejectText,
  onSuccess,
  open,
  onReject,
  title,
  subTitle,
  subTitleColor,
}) => {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#1B1C27] bg-opacity-30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-11/12 max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-[#EEEEEE] transition-all">
                <Dialog.Title className="text-base font-bold text-[#1B1C27] font-poppins">
                  {title}
                </Dialog.Title>
                <div className="mt-2">
                  <p
                    className="text-sm font-poppins"
                    style={{ color: subTitleColor || "#888888" }}
                  >
                    {subTitle}
                  </p>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  {rejectText && (
                    <button
                      type="button"
                      className="rounded-lg px-4 py-2 text-sm font-medium font-poppins text-[#888888] hover:bg-[#F5F6FF] transition-colors"
                      onClick={onReject}
                    >
                      {rejectText}
                    </button>
                  )}
                  <button
                    type="button"
                    className="rounded-lg border border-[#888CC4] bg-[#888CC4] hover:bg-[#7a7eb5] px-4 py-2 text-sm font-semibold font-poppins text-white transition-colors"
                    onClick={onSuccess}
                  >
                    {successText}
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

export default ConfirmBox;

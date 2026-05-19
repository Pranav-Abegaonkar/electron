import { useMeeting } from "@videosdk.live/react-sdk";
import React, { Fragment } from "react";
import useIsMobile from "../../hooks/useIsMobile";
import useIsTab from "../../hooks/useIsTab";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ChatPanel } from "./ChatPanel";
import { ParticipantPanel } from "./ParticipantPanel";
import { Dialog, Transition } from "@headlessui/react";
import { useMediaQuery } from "react-responsive";
import { useMeetingAppContext } from "../../MeetingAppContextDef";

const SideBarTabView = ({
  height,
  sideBarContainerWidth,
  panelHeight,
  panelHeaderHeight,
  panelHeaderPadding,
  panelPadding,
  handleClose,
}) => {
  const { participants } = useMeeting();
  const { sideBarMode } = useMeetingAppContext();
  const isChat = sideBarMode === "CHAT";

  return (
    // Outer shell — provides background colour and uniform padding around the card
    <div
      className={"bg-transparent mt-2"}
      style={{
        height,
        width: sideBarContainerWidth,
        paddingTop: panelPadding,
        paddingLeft: panelPadding,
        paddingRight: panelPadding,
        paddingBottom: panelPadding,
        boxSizing: "border-box",
      }}
    >
      {/* Inner card — fills the padded area completely */}
      <div
        className={`overflow-hidden flex flex-col bg-white border border-[#EEEEEE]`}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 12,
        }}
      >
        {/* Panel header */}
        {sideBarMode && (
          <div
            className="flex items-center justify-between shrink-0"
            style={{
              paddingLeft: panelHeaderPadding,
              paddingRight: panelHeaderPadding,
              height: panelHeaderHeight,
              borderBottom: "1px solid #EEEEEE",
            }}
          >
            <p className={`text-sm font-bold font-poppins text-[#1B1C27]`}>
              {sideBarMode === "PARTICIPANTS"
                ? `Participants (${new Map(participants)?.size})`
                : isChat
                  ? "In-Call Chat"
                  : sideBarMode.charAt(0).toUpperCase() + sideBarMode.slice(1).toLowerCase()}
            </p>
            <button
              className={`transition-colors text-[#888888] hover:text-[#1B1C27]`}
              onClick={handleClose}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Panel content — fills remaining height */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {sideBarMode === "PARTICIPANTS" ? (
            <ParticipantPanel panelHeight={panelHeight} />
          ) : sideBarMode === "CHAT" ? (
            <ChatPanel panelHeight={panelHeight} />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export function SidebarConatiner({ height, sideBarContainerWidth }) {
  const { raisedHandsParticipants, sideBarMode, setSideBarMode } = useMeetingAppContext();
  const isMobile = useIsMobile();
  const isTab = useIsTab();
  const isLGDesktop = useMediaQuery({ minWidth: 1024, maxWidth: 1439 });
  const isXLDesktop = useMediaQuery({ minWidth: 1440 });

  const panelPadding = 8;
  const paddedHeight = height - panelPadding * 2.5;

  const panelHeaderHeight = isMobile ? 40 : isTab ? 44 : isLGDesktop ? 48 : isXLDesktop ? 52 : 0;
  const panelHeaderPadding = isMobile ? 6 : isTab ? 8 : isLGDesktop ? 10 : isXLDesktop ? 12 : 0;

  const handleClose = () => setSideBarMode(null);

  return sideBarMode ? (
    isTab || isMobile ? (
      <Transition appear show={!!sideBarMode} as={Fragment}>
        <Dialog as="div" className="relative" style={{ zIndex: 9999 }} onClose={handleClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-40" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300" enterFrom="translate-y-full opacity-0 scale-95" enterTo="translate-y-0 opacity-100 scale-100"
            leave="ease-in duration-200" leaveFrom="translate-y-0 opacity-100 scale-100" leaveTo="translate-y-full opacity-0 scale-95"
          >
            <div className="fixed inset-0 overflow-y-hidden">
              <div className="flex h-screen items-center justify-center text-center">
                <Dialog.Panel className="w-screen transform overflow-hidden bg-[#1B1C27] shadow-xl transition-all">
                  <SideBarTabView
                    height="100%"
                    sideBarContainerWidth="100%"
                    panelHeight={height}
                    raisedHandsParticipants={raisedHandsParticipants}
                    panelHeaderHeight={panelHeaderHeight}
                    panelHeaderPadding={panelHeaderPadding}
                    panelPadding={panelPadding}
                    handleClose={handleClose}
                  />
                </Dialog.Panel>
              </div>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>
    ) : (
      <SideBarTabView
        height={paddedHeight}
        sideBarContainerWidth={sideBarContainerWidth}
        panelHeight={paddedHeight - panelHeaderHeight - panelHeaderPadding}
        raisedHandsParticipants={raisedHandsParticipants}
        panelHeaderHeight={panelHeaderHeight}
        panelHeaderPadding={panelHeaderPadding}
        panelPadding={panelPadding}
        handleClose={handleClose}
      />
    )
  ) : (
    <></>
  );
}

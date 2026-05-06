import { useMeeting } from "@videosdk.live/react-sdk";
import React, { Fragment } from "react";
import useIsMobile from "../../hooks/useIsMobile";
import useIsTab from "../../hooks/useIsTab";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ChatPanel } from "./ChatPanel";
import { ParticipantPanel } from "./ParticipantPanel";
import VirtualBackgroundContainer from "./VirtualBackgroundContainer";
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

  return (
    <div
      className="bg-[#1B1C27]"
      style={{
        height,
        width: sideBarContainerWidth,
        paddingTop: panelPadding,
        paddingLeft: panelPadding,
        paddingRight: panelPadding,
        paddingBottom: panelPadding,
      }}
    >
      <div
        className="bg-[#252636] overflow-hidden"
        style={{ height, borderRadius: 12 }}
      >
        {sideBarMode && (
          <div
            className="flex items-center justify-between"
            style={{
              padding: panelHeaderPadding,
              height: panelHeaderHeight - 1,
              borderBottom: "1px solid #3D3E5033",
            }}
          >
            <p className="text-sm font-bold text-white font-poppins">
              {sideBarMode === "PARTICIPANTS"
                ? `Participants (${new Map(participants)?.size})`
                : sideBarMode === "VIRTUALBACKGROUND"
                ? "Virtual Background"
                : sideBarMode.charAt(0).toUpperCase() + sideBarMode.slice(1).toLowerCase()}
            </p>
            <button
              className="text-[#9FA0B7] hover:text-white transition-colors"
              onClick={handleClose}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}
        {sideBarMode === "PARTICIPANTS" ? (
          <ParticipantPanel panelHeight={panelHeight} />
        ) : sideBarMode === "CHAT" ? (
          <ChatPanel panelHeight={panelHeight} />
        ) : sideBarMode === "VIRTUALBACKGROUND" ? (
          <VirtualBackgroundContainer panelHeight={panelHeight} />
        ) : null}
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
  const paddedHeight = height - panelPadding * 3.5;

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

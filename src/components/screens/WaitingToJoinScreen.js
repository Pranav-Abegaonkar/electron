import React, { useEffect, useRef, useState } from "react";
import animationData from "../../../src/static/animations/join_meeting.json";
import Lottie from "lottie-react";
import useIsTab from "../../hooks/useIsTab";
import useIsMobile from "../../hooks/useIsMobile";

const WaitingToJoinScreen = () => {
  const waitingMessages = [
    { index: 0, text: "Creating a room for you..." },
    { index: 1, text: "Almost there..." },
  ];
  const [message, setMessage] = useState(waitingMessages[0]);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setMessage((s) =>
        s.index === waitingMessages.length - 1 ? s : waitingMessages[s.index + 1]
      );
    }, 3000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const isTab = useIsTab();
  const isMobile = useIsMobile();

  return (
    <div className="bg-[#F5F6FF] h-screen flex flex-col items-center justify-center font-poppins">
      <header className="absolute top-0 left-0 right-0 flex justify-center pt-10">
        <span className="text-[#888CC4] font-bold text-2xl tracking-wider">TYHO</span>
      </header>
      <div className="flex flex-col items-center">
        <div
          style={{
            height: isTab ? 200 : isMobile ? 180 : 240,
            width: isTab ? 200 : isMobile ? 180 : 240,
          }}
        >
          <Lottie
            loop
            autoplay
            animationData={animationData}
            rendererSettings={{ preserveAspectRatio: "xMidYMid slice" }}
            style={{ height: "100%", width: "100%" }}
          />
        </div>
        <p className="text-[#1B1C27] font-semibold text-lg mt-4 text-center">{message.text}</p>
        <p className="text-[#888888] text-sm mt-1 text-center">Please wait while we set things up.</p>
      </div>
    </div>
  );
};

export default WaitingToJoinScreen;

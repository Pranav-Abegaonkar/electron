import UploadIcon from "../icons/NetworkStats/UploadIcon"
import DownloadIcon from "../icons/NetworkStats/DownloadIcon"
import RefreshIcon from "../icons/NetworkStats/RefreshIcon"
import RefreshCheck from "../icons/NetworkStats/RefreshCheck"
import { runPreCallTest } from "@videosdk.live/react-sdk";
import WifiOff from "../icons/NetworkStats/WifiOff";
import { useEffect, useRef, useState } from "react";
import useIsMobile from "../hooks/useIsMobile";
import { getToken } from "../api";

// quality score 1–5 from VideoSDK runPreCallTest result.networkQuality
const QUALITY_LABEL = { 1: "BAD", 2: "POOR", 3: "FAIR", 4: "GOOD", 5: "EXCELLENT" };
const QUALITY_COLOR = {
  1: "text-red-500",
  2: "text-orange-400",
  3: "text-yellow-400",
  4: "text-green-400",
  5: "text-green-300",
};

const getErrorMessage = (code) => {
  switch (code) {
    case "ERROR_PRECALL_INVALID_TOKEN": return "Auth error";
    case "ERROR_PRECALL_TEST_FAILED": return "Network test failed";
    case "ERROR_PRECALL_MEDIA_CHECK_FAILED": return "No mic / camera found";
    case "ERROR_PRECALL_TEST_ALREADY_RUNNING": return "Test already running";
    case "ERROR_CAMERA_ACCESS_DENIED_OR_DISMISSED": return "Camera permission denied";
    case "ERROR_MICROPHONE_IN_USE":
    case "ERROR_CAMERA_IN_USE": return "Device in use";
    default: return "Something went wrong";
  }
};

const NetworkStats = ({ }) => {
  // "loading" | "done" | "error"
  const [status, setStatus] = useState("loading");
  const [downlink, setDownlink] = useState(null);
  const [uplink, setUplink] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const isMobile = useIsMobile();
  const testRef = useRef(null);

  useEffect(() => {
    runNetworkTest();
    return () => { testRef.current?.stop?.(); };
  }, []);

  const runNetworkTest = async () => {
    testRef.current?.stop?.();
    setStatus("loading");
    setDownlink(null);
    setUplink(null);
    setErrorMsg("");
    try {
      const token = await getToken();
      const test = runPreCallTest({
        token,
        samplingDuration: 15000,
        audioOnly: false,
        onStatsChange: (stats) => {
          // live partial quality scores if SDK exposes them during sampling
          const nq = stats?.networkQuality;
          if (nq?.downlink?.quality != null) setDownlink(nq.downlink.quality);
          if (nq?.uplink?.quality != null) setUplink(nq.uplink.quality);
        },
      });
      testRef.current = test;
      const result = await test;
      console.log("result", result);

      if (result?.aborted) return;
      const nq = result?.networkQuality;
      setDownlink(nq?.downlink?.quality ?? null);
      setUplink(nq?.uplink?.quality ?? null);
      setStatus("done");
    } catch (ex) {
      setErrorMsg(getErrorMessage(ex?.code));
      setStatus("error");
      console.log("Pre-call test error:", ex?.code, ex?.message);
    }
  };

  const QualityChip = ({ score }) =>
    score != null
      ? <span className={`font-semibold ${QUALITY_COLOR[score]}`}>{QUALITY_LABEL[score]}</span>
      : <span className="text-customGray-250">—</span>;

  return (
    <div className="flex flex-row auto-cols-max border border-[#3F4346] divide-x divide-[#3F4346] rounded-md bg-black opacity-80 h-9">

      {status === "loading" && (
        <div className="inline-flex items-center gap-3 text-xs text-customGray-250 px-3">
          Checking network quality
          <RefreshCheck />
        </div>
      )}

      {status === "done" && (
        <>
          <div className={`inline-flex items-center gap-2 text-xs text-customGray-250 px-3 basis-1/2 ${!isMobile && "min-w-[7.5rem]"}`}>
            <DownloadIcon />
            <QualityChip score={downlink} />
          </div>
          <div className={`inline-flex items-center gap-2 text-xs text-customGray-250 px-3 basis-1/2 ${!isMobile && "min-w-[7.5rem]"}`}>
            <UploadIcon />
            <QualityChip score={uplink} />
          </div>
          <div className="flex items-center justify-center px-2 cursor-pointer" onClick={runNetworkTest}>
            <RefreshIcon />
          </div>
        </>
      )}

      {status === "error" && (
        <>
          <div className="inline-flex items-center gap-2 text-xs text-red-400 px-3">
            <WifiOff />
            {errorMsg}
          </div>
          <div className="flex items-center justify-center px-2 cursor-pointer" onClick={runNetworkTest}>
            <RefreshIcon />
          </div>
        </>
      )}

    </div>
  );
};

export default NetworkStats;

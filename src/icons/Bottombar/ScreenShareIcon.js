import * as React from "react";

const ScreenShareIcon = (props) => {
  const c = props.fillcolor || "#fff";
  return (
    <svg
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill="none"
      stroke={c}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
      <path d="M9 11l3-3 3 3M12 8v5" />
    </svg>
  );
};

export default ScreenShareIcon;

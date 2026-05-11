import * as React from "react";

const WhiteboardIcon = (props) => {
  const c = props.fillcolor || props.color || "#fff";
  return (
    <svg width={24} height={24} fill="none" stroke={c} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M7 16v5M17 16v5M9 14h6" />
      <path d="M6 8c2-2 4 4 6 2s2-4 4-2" />
    </svg>
  );
};

export default WhiteboardIcon;

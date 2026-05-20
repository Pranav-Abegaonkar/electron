import * as React from "react";

const WhiteboardIcon = (props) => {
  const c = props.fillcolor || props.color || "#fff";
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke={c} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* pencil body */}
      <path d="M16.862 3.487a2.25 2.25 0 0 1 3.182 3.182L6.75 20H3v-3.75L16.862 3.487Z" />
      {/* pencil highlight line */}
      <path d="M14.25 5.25l3 3" />
    </svg>
  );
};

export default WhiteboardIcon;

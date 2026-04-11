import * as React from "react";

const WhiteboardIcon = (props) => (
  <svg
    width={24}
    height={24}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M3 3h18a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm1 2v11h16V5H4Zm3 8.5 2.5-3 2 2.5 2.5-3.5L17 13.5H7ZM8 21h8v2H8v-2Z"
      fill={props.fillcolor || props.color || "#fff"}
    />
  </svg>
);

export default WhiteboardIcon;

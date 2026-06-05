import { h } from "preact";
import { StyledLogsLayer } from "./LogsLayer.styles.jsx";

export function LogsLayer({ children, isVisible = false }) {
  return <StyledLogsLayer $isVisible={isVisible}>{children}</StyledLogsLayer>;
}
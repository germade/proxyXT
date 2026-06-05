import { h } from "preact";
import { StyledActiveFooter } from "./ActiveFooter.styles.jsx";

export function ActiveFooter({ children, ...rest }) {
  return <StyledActiveFooter {...rest}>{children}</StyledActiveFooter>;
}
import { h } from "preact";
import { StyledAppTitle } from "./AppTitle.styles.jsx";

export function AppTitle({ children }) {
  return <StyledAppTitle>{children}</StyledAppTitle>;
}
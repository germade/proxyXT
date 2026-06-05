import { h } from "preact";
import { StyledHeaderActions } from "./HeaderActions.styles.jsx";

export function HeaderActions({ children }) {
  return <StyledHeaderActions>{children}</StyledHeaderActions>;
}
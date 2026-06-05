import { h } from "preact";
import { StyledFooterActions } from "./FooterActions.styles.jsx";

export function FooterActions({ children }) {
  return <StyledFooterActions>{children}</StyledFooterActions>;
}
import { h } from "preact";
import { StyledFooterProxyValue } from "./FooterProxyValue.styles.jsx";

export function FooterProxyValue({ children, isActive = false }) {
  return <StyledFooterProxyValue $isActive={isActive}>{children}</StyledFooterProxyValue>;
}
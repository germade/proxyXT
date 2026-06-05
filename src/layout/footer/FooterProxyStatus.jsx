import { h } from "preact";
import { StyledFooterProxyStatus } from "./FooterProxyStatus.styles.jsx";

export function FooterProxyStatus({ children, ...rest }) {
  return <StyledFooterProxyStatus {...rest}>{children}</StyledFooterProxyStatus>;
}
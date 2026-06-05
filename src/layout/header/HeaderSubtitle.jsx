import { h } from "preact";
import { StyledHeaderSubtitle } from "./HeaderSubtitle.styles.jsx";

export function HeaderSubtitle({ children, ...rest }) {
  return <StyledHeaderSubtitle {...rest}>{children}</StyledHeaderSubtitle>;
}
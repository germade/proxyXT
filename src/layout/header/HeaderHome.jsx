import { h } from "preact";
import { StyledHeaderHome } from "./HeaderHome.styles.jsx";

export function HeaderHome({ children, ...rest }) {
  return <StyledHeaderHome {...rest}>{children}</StyledHeaderHome>;
}
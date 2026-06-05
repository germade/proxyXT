import { h } from "preact";
import { StyledContentStack } from "./ContentStack.styles.jsx";

export function ContentStack({ children, ...rest }) {
  return <StyledContentStack {...rest}>{children}</StyledContentStack>;
}
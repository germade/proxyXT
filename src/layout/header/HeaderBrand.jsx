import { h } from "preact";
import { StyledHeaderBrand, StyledHeaderText } from "./HeaderBrand.styles.jsx";

export function HeaderBrand({ children }) {
  return <StyledHeaderBrand>{children}</StyledHeaderBrand>;
}

export function HeaderText({ children }) {
  return <StyledHeaderText>{children}</StyledHeaderText>;
}
import styled, { keyframes } from "styled-components";

const appReveal = keyframes`
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const StyledAppMain = styled.main`
  display: ${({ $isHidden }) => ($isHidden ? "none" : "block")};
  position: relative;
  z-index: 1;
  animation: ${appReveal} 260ms ease-out;
`;
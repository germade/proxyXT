import styled, { css, keyframes } from "styled-components";

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

export const ContentStack = styled.div`
  position: relative;
  overflow: hidden;
`;

export const LogsLayer = styled.div`
  display: ${({ $isVisible }) => ($isVisible ? "block" : "none")};
  position: absolute;
  inset: 0;
  pointer-events: auto;
  z-index: 2;
  transition: opacity 140ms ease;
`;

export const AppMain = styled.main`
  display: ${({ $isHidden }) => ($isHidden ? "none" : "block")};
  position: relative;
  z-index: 1;
  animation: ${appReveal} 260ms ease-out;
`;

export const AppHeader = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  padding: 12px;
`;

export const HeaderHome = styled.div`
  cursor: pointer;

  &:hover h1,
  &:hover p {
    color: #1f3249;
  }
`;

export const AppTitle = styled.h1`
  margin: 0;
  font-size: 1.26rem;
  letter-spacing: 0.01em;
  color: var(--brand-ink);
`;

export const HeaderSubtitle = styled.p`
  margin: 4px 0 0;
  color: #3d5163;
  font-size: 0.75rem;
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const AppFooter = styled.footer`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 16px;
  color: #40546d;
  font-size: 0.81rem;
  background: #ffffff;
  ${({ $isHidden }) =>
    $isHidden &&
    css`
      display: none;
    `}
`;

export const ActiveFooter = styled.span`
  min-width: 0;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const FooterProxyStatus = styled.span`
  color: #435364;
  cursor: pointer;

  &:hover {
    color: #2f445d;
  }
`;

export const FooterProxyLabel = styled.span`
  color: #435364;
`;

export const FooterProxyValue = styled.span`
  color: ${({ $isActive }) => ($isActive ? "var(--brand-blue)" : "#435364")};
`;

export const FooterActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
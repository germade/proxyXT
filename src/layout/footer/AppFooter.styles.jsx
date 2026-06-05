import styled, { css } from "styled-components";

export const StyledAppFooter = styled.footer`
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
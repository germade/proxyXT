import styled from "styled-components";

export const StyledFooterProxyValue = styled.span`
  color: ${({ $isActive }) => ($isActive ? "var(--brand-blue)" : "#435364")};
`;
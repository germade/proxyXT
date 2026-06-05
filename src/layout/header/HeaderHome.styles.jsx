import styled from "styled-components";

export const StyledHeaderHome = styled.div`
  cursor: pointer;

  &:hover h1,
  &:hover p {
    color: #1f3249;
  }

  &:hover svg {
    filter: saturate(1.05);
  }
`;
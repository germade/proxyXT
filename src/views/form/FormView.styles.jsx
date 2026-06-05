import styled, { css } from "styled-components";

const buttonBaseStyles = css`
  border: none;
  border-radius: 9px;
  padding: 7px 10px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 120ms ease;

  &:focus-visible {
    outline: none;
  }
`;

export const FormPanel = styled.section`
  min-height: 192px;
  display: ${({ $isVisible }) => ($isVisible ? "block" : "none")};
`;

export const ProxyForm = styled.form`
  display: grid;
  gap: 8px;
  background: #f4f8ff;
  padding: 16px;
`;

export const FormRow = styled.div`
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr 1fr;
`;

export const HostColorRow = styled.div`
  display: grid;
  gap: 8px;
  grid-template-columns: 48px minmax(0, 1fr);
  align-items: end;
`;

export const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

export const SubmitButton = styled.button`
  ${buttonBaseStyles}
  background: var(--brand-blue);
  color: #fff;

  &:hover {
    background: #0967d4;
    filter: none;
  }
`;

export const DeleteButton = styled.button`
  ${buttonBaseStyles}
  margin-left: auto;
  background: #ffffff;
  color: #334a66;
  display: ${({ $isVisible }) => ($isVisible ? "inline-block" : "none")};

  &:hover {
    background: #e63946;
    color: #ffffff;
  }
`;
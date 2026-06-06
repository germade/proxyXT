import { h } from "preact";
import styled from "styled-components";

const Wrapper = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px;
  border-radius: 8px;
  cursor: pointer;
  background: transparent;
  transition: background 120ms ease;
  
  &:hover {
    background: #f4f8ff;
  }

  &:active {
    background: #eaf1fb;
  }
`;

const Control = styled.input`
  width: 18px;
  height: 18px;
  margin: 0;
  accent-color: var(--brand-blue);
`;

export function CheckboxField({ id, checked, onChange, label, className }) {
  return (
    <Wrapper className={className}>
      <Control
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.currentTarget.checked)}
      />
      <span>{label}</span>
    </Wrapper>
  );
}

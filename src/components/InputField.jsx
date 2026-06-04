import { h } from "preact";
import styled from "styled-components";

const Label = styled.label`
  font-size: 0.76rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  text-transform: none;
  display: grid;
  gap: 5px;
  color: #4a5e78;
`;

const Control = styled.input`
  width: 100%;
  border: none;
  border-radius: 6px 6px 3px 3px;
  padding: 12px 11px 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #243247;
  background: #edf2f8;
  box-shadow: inset 0 -2px 0 #9cb2d0;
  transition: background 120ms ease, box-shadow 120ms ease;
  appearance: none;

  &::placeholder {
    color: #7e8da3;
  }

  &:focus {
    outline: none;
    background: #e9f1ff;
    box-shadow: inset 0 -3px 0 var(--brand-blue), 0 0 0 1px rgba(0, 83, 255, 0.2);
  }
`;

export function InputField({ label, id, value, onInput, type = "text", ...rest }) {
  return (
    <Label>
      <span>{label}</span>
      <Control
        id={id}
        type={type}
        value={value}
        onInput={(event) => onInput(event.currentTarget.value)}
        {...rest}
      />
    </Label>
  );
}

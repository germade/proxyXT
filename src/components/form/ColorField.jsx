import { h } from "preact";
import styled from "styled-components";

const Control = styled.input`
  width: 48px;
  height: 48px;
  box-sizing: border-box;
  border: none;
  border-radius: 8px;
  padding: 4px;
  background: #e6edf7;
  box-shadow: inset 0 0 0 1px #8ba4c6;
  transition: background 120ms ease, box-shadow 120ms ease;
  appearance: none;
  cursor: pointer;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  &::-webkit-color-swatch {
    border: none;
    border-radius: 5px;
  }

  &::-moz-color-swatch {
    border: none;
    border-radius: 5px;
  }

  &:focus {
    outline: none;
    background: white;
    box-shadow: inset 0 0 0 1px #4f79b6, 0 0 0 2px rgba(0, 83, 255, 0.15);
  }
`;

export function ColorField({ label, id, value, onChange, ...rest }) {
  return (
    <Control
      id={id}
      type="color"
      value={value}
      aria-label={label}
      title={label}
      onInput={(event) => onChange(event.currentTarget.value)}
      {...rest}
    />
  );
}

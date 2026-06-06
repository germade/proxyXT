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

const LabelText = styled.span`
  flex: 1 1 auto;
  min-width: 0;
`;

const LabelBadge = styled.span`
  flex: 0 0 auto;
  margin-left: auto;
  padding: 2px 6px;
  border-radius: 999px;
  font-size: 0.66rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.01em;
  color: #415a78;
  background: #dde9f9;
  box-shadow: inset 0 0 0 1px #b5c8e4;
`;

export function CheckboxField({ id, checked, onChange, label, badge, badgeTitle, className }) {
  return (
    <Wrapper className={className}>
      <Control
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.currentTarget.checked)}
      />
      <LabelText>{label}</LabelText>
      {badge ? <LabelBadge title={badgeTitle || badge}>{badge}</LabelBadge> : null}
    </Wrapper>
  );
}

import styled, { keyframes } from "styled-components";

const logsReveal = keyframes`
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const LogsPanel = styled.section`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: #ffffff;
  overflow: hidden;
  animation: ${logsReveal} 220ms ease-out;
`;

export const LogsToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px;
  background: #e5f0ff;
`;

export const ToolbarTitle = styled.strong`
  font-size: 0.83rem;
  color: #30445f;
`;

export const ToolbarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const OpenWindowButton = styled.button`
  border: none;
  background: transparent;
  color: #355170;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 7px;
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;

  &:hover {
    background: #d4e5ff;
    color: #203c5c;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 83, 255, 0.2);
  }
`;

export const CloseWindowButton = styled(OpenWindowButton)``;

export const LogsContent = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const LogEntryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: ${({ $level }) => {
    switch ($level) {
      case "success":
        return "#e8f8ef";
      case "warning":
        return "#fff3e0";
      case "error":
        return "#fdecea";
      case "debug":
        return "#f3e8ff";
      case "info":
      default:
        return "#e8f1ff";
    }
  }};
  border-color: ${({ $level }) => {
    switch ($level) {
      case "success":
        return "#b6e2c6";
      case "warning":
        return "#ffd39a";
      case "error":
        return "#f6b6b1";
      case "debug":
        return "#d6b7ff";
      case "info":
      default:
        return "#bfd7ff";
    }
  }};
`;

export const LogTime = styled.span`
  font-size: 0.62rem;
  color: #657d98;
  font-family: "SF Mono", "Consolas", monospace;
`;

export const LogMain = styled.span`
  font-size: 0.72rem;
  line-height: 1.4;
  color: #1f3249;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: "SF Mono", "Consolas", monospace;
`;

export const LogContext = styled.pre`
  margin: 2px 0 0;
  padding: 4px 6px;
  background: rgba(255, 255, 255, 0.52);
  border-radius: 0 4px 4px 0;
  font-size: 0.68rem;
  line-height: 1.45;
  color: #2d425a;
  font-family: "SF Mono", "Consolas", monospace;
  white-space: pre;
  overflow-x: auto;
`;
import { h } from "preact";
import { AddBackButton } from "../../components/AddBackButton.jsx";
import { LanguageBadge } from "../../components/LanguageBadge.jsx";
import { LogsSvg } from "../../components/icons/LogsSvg.jsx";
import { ActiveFooter } from "./ActiveFooter.jsx";
import { FooterActions } from "./FooterActions.jsx";
import { FooterProxyLabel } from "./FooterProxyLabel.jsx";
import { FooterProxyStatus } from "./FooterProxyStatus.jsx";
import { FooterProxyValue } from "./FooterProxyValue.jsx";
import { StyledAppFooter } from "./AppFooter.styles.jsx";

export function AppFooter({
  isHidden = false,
  footerFeedbackMessage,
  footerFeedbackStyle,
  handleOpenList,
  t,
  activeServerId,
  activeProxyDisplay,
  languagePreference,
  effectiveLanguage,
  handleOpenPreferences,
  view,
  hasErrorLogs,
  onToggleLogs
}) {
  return (
    <StyledAppFooter $isHidden={isHidden}>
      <div>
        {footerFeedbackMessage ? (
          <ActiveFooter id="activeFooter" style={footerFeedbackStyle}>
            {footerFeedbackMessage}
          </ActiveFooter>
        ) : (
          <FooterProxyStatus id="activeFooter" onClick={handleOpenList}>
            <FooterProxyLabel>{t("footer.proxyLabel")}</FooterProxyLabel>
            <FooterProxyValue isActive={Boolean(activeServerId)}> {activeProxyDisplay}</FooterProxyValue>
          </FooterProxyStatus>
        )}
      </div>

      <FooterActions>
        <LanguageBadge
          preference={languagePreference}
          effectiveLanguage={effectiveLanguage}
          t={t}
          onClick={handleOpenPreferences}
        />

        <AddBackButton
          variant="icon"
          slot="footer"
          active={view === "logs"}
          hasError={hasErrorLogs}
          ariaLabel={view === "logs" ? t("buttons.logs.hide") : t("buttons.logs.show")}
          title={t("buttons.logs.title")}
          onClick={onToggleLogs}
        >
          <LogsSvg />
        </AddBackButton>
      </FooterActions>
    </StyledAppFooter>
  );
}
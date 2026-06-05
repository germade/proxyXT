import { h } from "preact";
import { useState } from "preact/hooks";
import {
  EmptyStateActionButton,
  EmptyStateCard,
  EmptyStateMessage,
  ListContainer,
  ListPanel,
  ServerDragPlaceholder,
  ServerEditButton,
  ServerRowContainer,
  ServerListItem,
  ServerList,
  ServerMainButton,
  ServerMeta,
  ServerName
} from "./ListView.styles.jsx";
import { DEFAULT_SELECTION_COLOR } from "../../lib/state.js";

function ServerRow({
  server,
  activeServerId,
  onToggle,
  onEdit,
  getServerDisplayName,
  t,
  isDragging,
  isDropTarget,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd
}) {
  const alias = String(server?.name || "").trim();
  const endpoint = `${server.scheme}://${server.host}:${server.port}`;
  const isActive = server.id === activeServerId;
  const hasMeta = Boolean(alias);
  const activeColor = String(server.selectionColor || DEFAULT_SELECTION_COLOR).trim().toUpperCase();

  return (
    <ServerRowContainer $isDropTarget={isDropTarget}>
      <ServerListItem
        draggable={true}
        $isDragging={isDragging}
        onDragStart={(event) => onDragStart(event, server.id)}
        onDragOver={(event) => onDragOver(event, server.id)}
        onDrop={(event) => {
          event.stopPropagation();
          onDrop(event, server.id);
        }}
        onDragEnd={onDragEnd}
      >
        <ServerMainButton
          type="button"
          $isActive={isActive}
          $activeColor={activeColor}
          $noMeta={!hasMeta}
          onClick={() => onToggle(server)}
        >
          <ServerName $isActive={isActive}>{alias || `${server.host}:${server.port}`}</ServerName>
          {hasMeta ? <ServerMeta $isActive={isActive}>{endpoint}</ServerMeta> : null}
        </ServerMainButton>
        <ServerEditButton
          type="button"
          $isActive={isActive}
          $activeColor={activeColor}
          title={t("buttons.server.edit")}
          aria-label={`${t("buttons.server.edit")} ${getServerDisplayName(server)}`}
          onClick={() => onEdit(server)}
        >
          ✎
        </ServerEditButton>
      </ServerListItem>
      <ServerDragPlaceholder $isVisible={isDragging} aria-hidden="true" />
    </ServerRowContainer>
  );
}

export function ListView({
  t,
  view,
  isInitialStateLoading,
  servers,
  activeServerId,
  onToggle,
  onEdit,
  getServerDisplayName,
  onAddServer,
  onReorder
}) {
  const isEmpty = !servers.length;
  const showEmptyState = !isInitialStateLoading && isEmpty;
  const [draggedServerId, setDraggedServerId] = useState(null);
  const [dropTargetServerId, setDropTargetServerId] = useState(null);

  function clearDragState() {
    setDraggedServerId(null);
    setDropTargetServerId(null);
  }

  function handleDragStart(event, serverId) {
    setDraggedServerId(serverId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", serverId);
  }

  function handleDragOver(event, serverId) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (dropTargetServerId !== serverId) {
      setDropTargetServerId(serverId);
    }
  }

  function handleDrop(event, serverId) {
    event.preventDefault();
    const sourceServerId = draggedServerId || event.dataTransfer.getData("text/plain");
    clearDragState();
    if (!sourceServerId || sourceServerId === serverId) {
      return;
    }
    onReorder?.(sourceServerId, serverId);
  }

  function handleListDrop(event) {
    event.preventDefault();
    const sourceServerId = draggedServerId || event.dataTransfer.getData("text/plain");
    const targetServerId = dropTargetServerId;
    clearDragState();
    if (!sourceServerId) {
      return;
    }
    if (targetServerId) {
      if (sourceServerId !== targetServerId) {
        onReorder?.(sourceServerId, targetServerId);
      }
      return;
    }

    const lastServerId = servers[servers.length - 1]?.id || null;
    if (lastServerId && sourceServerId !== lastServerId) {
      onReorder?.(sourceServerId, null);
    }
  }

  return (
    <ListPanel $isVisible={view === "list"}>
      <ListContainer>
        <ServerList onDragOver={(event) => event.preventDefault()} onDrop={handleListDrop}>
          {servers.map((server) => (
            <ServerRow
              key={server.id}
              server={server}
              activeServerId={activeServerId}
              onToggle={onToggle}
              onEdit={onEdit}
              getServerDisplayName={getServerDisplayName}
              t={t}
              isDragging={draggedServerId === server.id}
              isDropTarget={dropTargetServerId === server.id}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={clearDragState}
            />
          ))}
        </ServerList>
        <EmptyStateCard $isVisible={showEmptyState}>
          <EmptyStateMessage>{t("messages.noServers")}</EmptyStateMessage>
          <EmptyStateActionButton type="button" onClick={onAddServer}>
            {t("app.subtitle.addProxy")}
          </EmptyStateActionButton>
        </EmptyStateCard>
      </ListContainer>
    </ListPanel>
  );
}

import { Action, ActionPanel, Alert, confirmAlert, Icon, List, showToast, Toast } from "@raycast/api";
import { showFailureToast, usePromise } from "@raycast/utils";
import { isServerStillListening, readListeningProcesses } from "./server-client";
import type { LocalServer } from "./types";

export function ServersView() {
  const { data = [], isLoading, error, revalidate } = usePromise(readListeningProcesses);

  async function stopServer(server: LocalServer) {
    const confirmed = await confirmAlert({
      title: `Stop ${server.command}?`,
      message: `This will stop process ${server.pid} listening on port ${server.port}.`,
      primaryAction: { title: "Stop Process", style: Alert.ActionStyle.Destructive },
    });
    if (!confirmed) return;

    try {
      const currentServers = await readListeningProcesses();
      if (!isServerStillListening(server, currentServers)) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Process changed",
          message: `Nothing was stopped on port ${server.port}.`,
        });
        await revalidate();
        return;
      }

      process.kill(server.pid, "SIGTERM");
      await showToast({
        style: Toast.Style.Success,
        title: `Stopped ${server.command}`,
        message: `Port ${server.port}`,
      });
      await revalidate();
    } catch (stopError) {
      await showFailureToast(stopError, { title: `Could not stop ${server.command}` });
    }
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search local servers…">
      {!isLoading && error ? (
        <List.EmptyView icon={Icon.Warning} title="Could not inspect local servers" description={error.message} />
      ) : null}
      {!isLoading && !error && data.length === 0 ? (
        <List.EmptyView icon={Icon.Network} title="No listening servers found" />
      ) : null}
      {data.map((server) => (
        <List.Item
          key={`${server.pid}:${server.port}`}
          icon={Icon.Network}
          title={server.command}
          subtitle={`PID ${server.pid}`}
          accessories={[{ text: `:${server.port}` }]}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser title="Open Localhost" url={server.url} />
              <Action.CopyToClipboard title="Copy URL" content={server.url} />
              <Action.CopyToClipboard title="Copy PID" content={String(server.pid)} />
              <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={revalidate} />
              <Action
                title="Stop Process"
                icon={Icon.Stop}
                style={Action.Style.Destructive}
                onAction={() => stopServer(server)}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

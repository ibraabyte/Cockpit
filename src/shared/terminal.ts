import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const script = `on run argv
  set projectPath to item 1 of argv
  set toolPath to item 2 of argv
  tell application "Terminal"
    activate
    do script "cd " & quoted form of projectPath & " && exec " & quoted form of toolPath
  end tell
end run`;

export function terminalArguments(projectPath: string, toolPath: string): string[] {
  return ["-e", script, projectPath, toolPath];
}

export async function launchInTerminal(projectPath: string, toolPath: string): Promise<void> {
  await execFileAsync("/usr/bin/osascript", terminalArguments(projectPath, toolPath));
}

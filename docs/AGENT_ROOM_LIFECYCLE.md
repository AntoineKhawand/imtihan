# Agent Room lifecycle reporting

The Windows launcher optionally loads `scripts/agent-room-hooks.settings.json` through Claude Code's `--settings` argument. This file is machine-local and contains only `SubagentStart`/`SubagentStop` command hooks. Without it, the launcher behaves as before. It does not change global settings, tool permissions, prompts or agent dispatch decisions.

The private Agent Room source supplies `scripts/record-agent-event.cjs`, which reads hook input on stdin and emits only a timestamp, session/agent identifiers, an allowlisted department and start/stop kind. Messages, transcripts, prompts, credentials and arbitrary input fields are dropped. Failures produce no model context, no approval decisions and no blocking output. Hooks have a five-second timeout.

The status exporter reads these metadata events and the existing Windows task status. A crew is working only when the overall task is running and a current-run start lacks a corresponding stop. Parallel agents in one department remain working until all have stopped. A stop means idle, never successful QA or deployment. Old/future/unknown records are ignored. No lifecycle evidence means unknown.

The read-only browser status-file connection is separate from workflow rehearsal. Actual handoff messages are not exported, and no shipping animation claims a live deployment. No full paid overnight cycle is needed to validate the metadata fixtures; the first genuine cycle remains a separate production verification.

Official lifecycle contract: https://code.claude.com/docs/en/hooks#subagentstart

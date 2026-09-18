export const meta = {
  name: 'team-sync',
  description: 'Cross-team coordination: each team investigates independently, then a coordinator synthesizes agreement/conflicts and flags anything that is actually a business decision instead of guessing it',
  phases: [
    { title: 'Investigate' },
    { title: 'Synthesize' },
  ],
}

const ALL_TEAMS = ['engineering', 'seo-growth', 'content-curriculum', 'qa', 'design', 'marketing', 'database']

const FINDING_SCHEMA = {
  type: 'object',
  properties: {
    team: { type: 'string' },
    findings: { type: 'string' },
    position: { type: 'string' },
    blockers: { type: 'string' },
    dependsOnTeams: { type: 'array', items: { type: 'string' } },
  },
  required: ['team', 'findings', 'position'],
}

const DECISION_SCHEMA = {
  type: 'object',
  properties: {
    agreement: { type: 'string' },
    conflicts: { type: 'string' },
    decision: { type: 'string' },
    needsHumanDecision: { type: 'boolean' },
    escalationReason: { type: 'string' },
    nextSteps: { type: 'string' },
  },
  required: ['decision', 'needsHumanDecision'],
}

if (!args || !args.task) {
  throw new Error('team-sync requires args.task — a string describing the cross-team question or decision')
}

const teams = (args.teams && args.teams.length ? args.teams : ALL_TEAMS).filter((t) => ALL_TEAMS.includes(t))

log(`Cross-team sync on: ${args.task}`)
log(`Teams participating: ${teams.join(', ')}`)

phase('Investigate')
const findings = (await parallel(teams.map((team) => () =>
  agent(
    `Cross-team task: ${args.task}\n\nInvestigate this strictly from your own team's perspective. Read your domain file(s) first if relevant. Report: what you found, your position/recommendation, any blocker or dependency on another team's work, and which other teams (if any) you depend on. If the task implies a business/product/pricing/scope decision, say so plainly instead of picking an answer for the founder.`,
    { agentType: team, phase: 'Investigate', label: `investigate:${team}`, schema: FINDING_SCHEMA }
  )
))).filter(Boolean)

if (!findings.length) {
  log('No team returned findings — nothing to synthesize.')
  return { task: args.task, teams, findings: [], decision: null }
}

phase('Synthesize')
const decision = await agent(
  `You are the cross-team coordinator for Imtihan. Task: ${args.task}\n\nEach team investigated independently. Their findings:\n${JSON.stringify(findings, null, 2)}\n\nSynthesize: where the teams agree, where they genuinely conflict (and why), and what can be decided now on technical/quality grounds alone. Critically: if the real decision is a business call (pricing, scope, launch timing, brand/design direction) rather than a technical one, set needsHumanDecision=true and explain why in escalationReason instead of picking an answer yourself — never fabricate a business decision on the founder's behalf.`,
  { phase: 'Synthesize', label: 'coordinator', schema: DECISION_SCHEMA }
)

return { task: args.task, teams, findings, decision }

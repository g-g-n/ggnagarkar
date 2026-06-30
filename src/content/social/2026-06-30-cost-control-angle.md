# Cost and Control Angle - 2026-06-30

## Findings Summary

- Pivoted away from yesterday's reviewability theme into the economics of AI-assisted operations.
- Strongest angle: the hidden AI Ops cost is repeated discovery across separate SRE sessions.
- OpsRabbit positioning: shared investigation state plus a service knowledge graph avoids re-running alert, ownership, deploy, log, runbook, and infrastructure discovery for every responder.
- Control angle: centralized LLM usage provides token and cost visibility by incident, team, service, or workflow.
- Supporting proof point: OpsRabbit calculator frames AI investigation cost as something teams should estimate and tune.

## LinkedIn Draft

The hidden cost in AI-assisted incident response is not just model pricing.

It is repeated discovery.

If five SREs investigate the same issue in five separate AI sessions, the system may rediscover the same facts five times:

- what alert fired
- which service is affected
- who owns it
- what changed recently
- which logs and metrics matter
- which runbook applies
- what has already been checked

That is wasted token spend.
It is also wasted engineering attention.

This is where OpsRabbit's product direction matters: reusable infrastructure context, a service knowledge graph, and shared investigation output.

Once the system has built the operational picture, every responder and follow-up workflow should reuse it instead of starting from zero.

The control side matters too.

A centrally governed LLM account gives teams visibility into token and cost usage by incident, workflow, team, service, or customer. It also creates a cleaner policy surface for what data sources the AI can use.

My current take: shared investigation state is the cost and control layer for AI-assisted operations.

AI Ops should reduce repeated discovery, not multiply it across every chat window.

Owned note:
`https://www.ggnagarkar.com/writing/shared-investigation-state-is-the-ai-ops-cost-control-layer`

#AIOps #SRE #DevOps #AIAgents #EnterpriseAI #OpsRabbit

## X Draft

The hidden cost in AI-assisted incident response is repeated discovery.

If five SREs investigate the same issue in five separate AI sessions, the system may re-fetch the same alert, ownership, deploy, log, infra, and runbook context five times.

That is wasted tokens + wasted attention.

The better pattern: shared investigation state on top of reusable infra context and a service knowledge graph.

One discovery pass.
Many responders.
Central LLM cost/control.

`https://www.ggnagarkar.com/writing/shared-investigation-state-is-the-ai-ops-cost-control-layer`

#AIOps #SRE #DevOps #AIAgents

## Short Version

AI Ops cost control is not only about cheaper models.

It is about avoiding repeated discovery.

Shared investigation state, reusable infrastructure context, and a service knowledge graph let teams reuse what the system has already learned instead of paying for the same context assembly in every SRE's separate chat.

# CareSummarizer

CareSummarizer is a prior-authorization workspace for a case manager, a physician, and an auditor. CareLens is the assistant inside a case. It quotes the open record. It does not submit a request.

## Roles

The header switch is a demo. It is not access control. Anyone using this prototype can become a physician and sign off a case.

- Case manager: Maria Santos. Claims a case, sends it for sign-off, and sends a signed-off case to the payer.
- Physician: Dr. Robert Kim. Signs off, sends back, or escalates. Sign off stays disabled until the payer rules are met.
- Auditor: Jennifer Walsh. Reads the audit view.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000 for the introduction. The queue is at /queue. Sarah Johnson is patient `1`.

`npm test` checks the deadline sort, the due-today rule, and `rulesMet`. `npm run lint` runs ESLint. `npx tsc --noEmit` is the typecheck.

## What is mocked

Patients, rules, and deadlines are generated in the browser from a fixed seed. A refresh keeps the same cases. Nothing is saved. There is no payer connection and no model call.

Vercel Analytics is loaded on each page. It does not receive patient data from this app. The seed does not include a social security number.

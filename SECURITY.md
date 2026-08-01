# Security policy

AccountProof is currently a local, synthetic work sample. Do not submit secrets, customer data, vulnerability details from a real customer environment, or regulated information through the demo.

## Report a repository vulnerability

Use GitHub private vulnerability reporting if it is enabled for this repository. Otherwise contact the repository owner privately through the contact method on their GitHub profile. Do not open a public issue containing exploit details or sensitive data.

## Implemented boundary

- schema validation at HTTP and service boundaries;
- fail-closed account binding, evidence completeness, and version checks;
- deterministic receipts and explicit human review;
- no live integrations, credentials, persistence, telemetry, or external actions;
- source-only Supabase schema with RLS enabled on every application table;
- locked dependencies and an auditable local verification command set.

Live authentication, provider policies, deployment hardening, backups, monitoring, incident response, and penetration testing are not implemented and remain `UNKNOWN`.

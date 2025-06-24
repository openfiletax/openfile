# Encrypting taxpayer data

Date: 07/31/2023

## Status

Approved

## Context

Our system stores fact graphs containing sensitive taxpayer data including personally identifiable information (PII) and federal tax information (FTI). To mitigate the impact of a breach or leak, we want an approach for encrypting this data at rest. This approach should satisfy both our team's desired security posture and relevant compliance controls.

To date, we have considered a client-side approach and a server-side approach.

## Decision

We will implement server-side envelope encryption for securing taxpayer fact graphs at rest. We will generate a per-user symmetric data encryption key and use that key to encrypt fact graphs before storage in the taxpayer data store. The data encryption key will be encrypted using a root key and the encrypted key will be stored next to the fact graph in the taxpayer data store. The root key will be managed by AWS's Key Management Service (KMS).

## Consequences

- The server-side approach reduces implementation complexity, allowing us to meet our desired security qualities and maintain timelines for pilot launch
- We will need to implement additional mitigations to avoid information disclosure of plaintext fact graph data (e.g., through logging)
- We aren't reinventing the wheel, and we can take advantage of industry-standard encryption functionality provided by AWS KMS
- Plaintext fact graphs will be visible to the public-facing API gateway and other supporting services that sit between the web frontend and the Direct File API. Plaintext fact graphs will also be accessible to an administrator with the necessary decrypt permissions within KMS
- If needed, fact graph data can be migrated server-side
- Future layers of protection (e.g., message-level encryption) can be added as our threat model matures
- We will need to identify a stand-in for KMS in local environments and put any KMS-specific code behind an abstraction layer

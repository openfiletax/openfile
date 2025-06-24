# AWS KMS Key Management

Date: 10/23/2023

## Status

Draft

## Context

[ADR: Encrypting Taxpayer Data](adr_encrypting-taxpayer-data.md) specifies our strategy for encrypting taxpayer data.

Using AWS KMS keys, our system encrypts sensitive taxpayer data. Since the keys and their access makes 
it possible to encrypt and decrypt the system's production data, we want to specify the standard operating procedure for
brokering, configuration, access management, and rotation for these keys.

## Decision

### Key Creation and Configuration

The IRS team overseeing our application infrastructure will be responsible for setting up the KMS keys for each environment/region,
and managing access to those keys.

We use KMS Customer Managed Keys with usage of `ENCRYPT_DECRYPT` and the encryption algorithm of 
`SYMMETRIC_DEFAULT` (which is a 256-bit AES-GCM algorithm). 
Additionally, the keys are set up as multi-region to support the IRS environments' ACTIVE-ACTIVE application infrastructure.

Our application(s) using the KMS encryption keys are configured to specify the key ARN, in keeping with AWS's recommendations 
for using [strict mode](https://docs.aws.amazon.com/encryption-sdk/latest/developer-guide/best-practices.html#strict-discovery-mode).
 
### Access Management
* The least amount of privilege is given to application users of the KMS keys, which are governed by a combination of key 
  policies and IAM policies managed by IRS administrators.
* Direct File has access to the encryption keys for the following actions:
  * GenerateDataKey
  * kms:Encrypt
  * kms:Decrypt
* The IRS's AWS cloud administrators have full key access rights.

### Rotation
We have automatic key rotation in KMS with the default schedule for customer managed keys.

KMS wrapping key rotation will happen automatically without intervention or need to update our configuration, as the properties 
of the key never change (only the cryptographic material/secrets).

(from https://docs.aws.amazon.com/kms/latest/developerguide/rotate-keys.html):
  > When you enable automatic key rotation for a KMS key, AWS KMS generates new cryptographic material for the KMS key every year. 
  > AWS KMS saves all previous versions of the cryptographic material in perpetuity so you can decrypt any data encrypted with that KMS key. 
  > AWS KMS does not delete any rotated key material until you delete the KMS key. You can track the rotation of key material for your KMS keys in Amazon CloudWatch and AWS CloudTrail.
  
## Consequences
- We follow recommended practices so that we have confidence in the maintainability and validity of our key management strategies
- We limit access to our KMS encryption keys to only our application and IRS cloud administrators
- With automated key rotation, rotations are passive to our application, with no configuration updates needed.
- Importantly, if keys are compromised, automated key rotation will not mitigate the issue.

## Resources

- [ADR for encrypting taxpayer data](adr_encrypting-taxpayer-data.md)
- https://docs.aws.amazon.com/kms/latest/developerguide/rotate-keys.html
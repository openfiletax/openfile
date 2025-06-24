# ADR: Configuration Management
DATE: 07/05/2023

## Background

A Configuration Management Plan is required in order to maintain proper control over the software and infrastructure in use by DirectFile.

This plan will be used by developers, operators, and security engineers and assessors in order to verify that the software and services in use have been properly vetted and authorized before being used. The plan must lay out policies and procedures for configuration management that speak to the needs of the Configuration Management Plan (CMP) Data Item Description (DID).

## Decision

The CM plan policies will be broken down into component stages for ease of consumption by the day-to-day engineers on the DirectFile team.

1. Development. This file will define policies and procedures for integrating new configuration and updating configuration of application code, including adding new features and required CI/CD scans and Pull Request approvals. This should also include any details on software that must be installed on developer's laptops above and beyond the standard-issue IRS GFE.
1. Infrastructure: This file will define policies and procedures for our infrastructure-as-code (IaC) implementation. This should also include details on how the baseline of deployed services is maintained, verified, and audited.
1. Deployment: This file will define policies and procedures for deploying changes to various IEP environments. This should also include details on how the baseline of runtime configuration is maintained, verified, and audited.

These files will be referenced by link to the established CMP DID to ensure each section of the CMP is covered by our policies and procedures. They should also be referenced from the full project's README.

## Rationale

The referential approach serves two purposes:

1. Day-to-day usefulness. By storing the CM policies alongside the code and IaC implementations, we reduce the onboarding burden, and ensure all engineers know the policies they are required to follow in developing and deploying DirectFile.
1. Accurate compliance. By utilizing the CMP DID as designed, we ensure that we speak to all aspects of IRS CMP processes. Additionally, by utilizing links to version-controlled documents rather than copying and pasting we ensure that our compliance documentation is accurate and up-to-date at all times.

## Status

Proposed

## Consequences

Each file must include some boilerplate to ensure future updaters know that certain questions from the CMP DID are being answered by the CM policies.

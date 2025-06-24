# RFC: SQS listener configuration
- Created: 9/10/2024
- Status: created


# Problem Statement
[problem statement]: #problem-statement
Which approach will we use to improve the graceful shutdown of SQS listeners in
Direct File's microservices?

# Goals and Non-Goals
[goals and non-goals]: #goals-and-non-goals
- Primary goal: Eliminate SQS exceptions seen on routine application shutdown
  during deployments
- Secondary goal: Reduce complexity of SQS listener configuration

# Background & Motivation
[background and motivation]: #background--motivation
Currently, the class that sets up the SQS Connection (named
`SqsConnectionSetupService` in most, if not all, cases) in each microservice
includes a `@PreDestroy` method to stop and close the JMS SQS connection factory
during application shutdown. Even with this method in place, as old containers
shut down during rolling application deployments, they generate consumer
prefetch and receive message exceptions.

The `SqsConnectionSetupService` classes also contain a significant amount of
boilerplate code and must be updated anytime a microservice needs to subscribe
to another SQS queue.

# Suggested Solution
[design]: #suggested-solution
Create a Spring Boot starter (e.g., `irs-spring-boot-starter-sqs-jms`) that uses
`org.springframework:spring-jms` to manage the SQS connection factory. Having
Spring JMS manage the lifecyle of the listener containers should improve the
graceful shutdown. At the very least, implementing this solution will allow us
to test this and confirm whether we see an improvement.

Encapsulating the configuration in a Spring Boot starter will simplify the setup
for Direct File Spring Boot microservices that subscribe to SQS queues.

Implementation steps:
- Add the starter and integrate with the backend in one PR to start
- Integrate other apps with the starter in separate PRs (email-service, status,
  submit

# Timeline
[timeline]: #timeline
About 1 sprint to implement the Spring Boot starter and update the various
microservices to use it. Initial prototyping and testing has already been done.

# Dependencies
[dependencies]: #dependencies
This solution will add a new Java dependency: `org.springframework:spring-jms`.

# Alternatives Considered
[alternatives]: #alternatives-considered

- Spring Cloud AWS. Spring Cloud AWS could also simplify our SQS configuration
  and likely have a similar benefit in terms of improving graceful shutdown.
  If we were already using Spring Cloud AWS, I would lean towards using it for
  SQS. However, Spring Cloud AWS does not yet support Spring Boot `3.3.x`. Given
  that we already use JMS for the SQS listeners, introducing the Spring JMS
  project should be a lower lift.
- Explore other modifications to `SqsConnectionSetupService`. Perhaps there is a
  way to modify our existing SQS connection setup to improve the graceful
  shutdown, but it is unclear what that implementation would look like, and at
  this point, there is likely value in exploring whether there is an existing
  framework/library that can solve this problem for us.

# Operations and Devops
[operations]: #operations-and-devops
No operational/devops work expected.

# Security/Privacy/Compliance
[security privacy compliance]: #security-privacy-compliance
No security/privacy/compliance impacts expected.

# Risks
[risks]: #risks
Adds a new dependency, which may require some time for the team to get familiar
with, but this risk should be minimized by the fact that the applications would
still be using JMS, rather than making more significant changes to how the
application manages SQS subscriptions/listening.

# Revisions
[revisions]: #revisions
RFC Updates for major changes, including status changes.
- created
- updated
- revisions based on feedback
- final status

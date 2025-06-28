Created At: July 19, 2024 Updated At: May 26, 2024

RFC: Status Service 2.0 (f/k/a One Status to Rule them All)

Problem Statement
=================

Today, the editability of a tax return within the Client is computed
differently than the status banner that is shown to the taxpayer within
the Client as well as the exportability of a tax return into a State
filing tool. The discrepancy of editability vs. exportability/status
representation has been a constant topic of conversation since last
filing season and a major source of confusion from an engineering and
operational perspective. Moreover, the current design adds a large
amount of unnecessary overhead in REST calls and database queries to and
within the Status service, which cannot be scaled to accommodate
increased load. 50x more scale in FS25 would risk introducing
performance related problems under load in production.

This RFC proposes a unification of these statuses into a single,
pre-existing status that controls all operations related to
post-submission processing from the standpoint of the Client, Backend
and State-API.

Background
==========

Application Considerations
--------------------------

The statefullness of the Status services derived from the 2023 need to
demo a full POC of Direct File. The current design is built directly on
the POC in a way that causes multiple datastores across microservices to
store redundant data.

The exportability of a tax return for State-API purposes and the status
representation logic in the Client is based on logic within the Status
service (specifically the TaxReturnXMLController that interfaces with
the AcknowledgementService). Both operations are sent through internal
REST calls from State-API and Backend, respectively, to the Status
service, which handles all the business and database logic.

However, the editability of a tax return is wholly controlled by the
Backend service and Backend database, specifically in the
TaxReturnService.isTaxReturnEditable() logic which under the hood makes
a query against the TaxReturnSubmissionRepository which queries the
TaxReturnSubmission and SubmissionEvent tables.

Architectural Considerations
----------------------------

The Status service has a single pod running in each region. It doesn’t
have autoscaling enabled in any way, which means that the only way we
can scale it is vertically. For reference, the Backend service can scale
to 96 pods max (48 per region). The client makes this call every 60
seconds whenever a user has an active session and is on the dashboard
(post-submission), until a non-pending status is returned. For a given
15 minute session, this means that the client could make 15 calls to
poll the status, if the return is determined to be pending for that time
period. This creates a situation where nearly all requests are
unnecessary and just add overhead to the Backend and Status services.

Why we should expect the Status service to become a bottleneck in FS25 and beyond
=================================================================================

The current design is not positioned to scale well in FS25 and beyond.
Today, exporting a return and fetching the status are the two most
expensive API calls we have throughout our systems, typically lasting
between 3-10 seconds (depending on system load). Under an order of
magnitutde of increased load, we would expect to see further elevated
latency for these operations, likely on the order of 10-20 seconds. This
is because of increased resource consumption/contention in the Status
service, particurlarly at the database level. In other words, the Status
service will become a bottleneck that will have cascading effects onto
the State-API, Backend and Client, and directly onto the taxpayer.

If we have a huge rush of traffic from both the client (via the Backend)
and State-API (first day, last day of filing season), we will greatly
increase the number of cross-service REST calls and database queries in
a way that would hamper performance for other parts of the Status
service, for instance polling MeF for acknowledgements (its primary
purpose). It will also provide poor user experiences for filers trying
to export their returns, as well as cause confusion if/when the
editability of a return within the Client is different than the banner
indicating the return’s status.

Proposal
========

There are a few ways to solve this bottleneck problem:

1. Deprecate the Status service’s endpoint completely and instead rely
   on the Backend database as the source of truth for statuses as well
   as horizontal scaling capacity of the backend for throughput
   purposes.
2. Convert the Status service’s endpoint to consume submissionIds
   instead of taxReturnIds and caching the results in Redis (with a
   short-ish TTL)
3. Remove the Backend as the proxy for requests to the Status service
   and make calls directly to the Status service
4. Decrease the rate at which the client polls the /status endpoint

Each solution has pros and cons, however I would advocate that we
implement Solution 1. Solution 2 is a fallback, and both are discussed
below.

What does the system look like if we implement Solution 1?
----------------------------------------------------------

-  Fetching return status into the Client and exporting a return to the
   State filing tool are significantly more performant through a
   combination of caching, no internal REST calls, reduced number of
   database calls, and reliance on the Backend horizontal pod
   autoscaling.
-  Tax return editability in the Client is managed by the Backend
   database
-  Tax return exportability to State filing tools is managed by the
   Backend database and accessed via a Backend internal API
-  Tax return editability and exportability are managed by the same
   domain object (SubmissionEvent) and are thus much easier to reason
   about.
-  There are no internal API calls to the Status service
-  The same guardrails for always preferring accepted submissions is in
   place, guarding us against duplicate submissions.

Solution 1 Implementation Proposal
==================================

-  ☐ [STEP 1, START HERE] Migrate the
   AcknowledgementService.getLatestSubmissionIdByTaxReturnIdPreferringAcceptedSubmission
   logic to the TaxReturnService and refactor the underlying query to
   rely on SubmissionEvents instead of Completed/Pending objects.

   -  ☐ This interface should be the single SOT for determining if a
      return is accepted or rejected, for frontend editability and
      state-api export purposes.
   -  ☐ It should probably be named something like
      ``getLatestSubmissionEventByTaxReturnIdPreferringAcceptedSubmissions``

-  ☐ Migrate the Status service’s AcknowledgementController.get()
   interface into the Backend app and expose the internal endpoint to
   the State-API.

   -  ☐ The query logic at AcknowledgementController.java#L56 can be
      deprecated and instead leverage the new interface in the
      TaxReturnService described in step 1.
   -  ☐ Alternatively, implement this logic within the State API service
      itself for fetching XML from S3 depending on the outcome of the
      ``/status`` call?

-  ☐ Migrate the Status service’s TaxReturnXMLController into the
   Backend and expose the internal endpoint to the State-API.

   -  ☐ The getTaxReturnStatus in TaxReturnXmlController.java#L32) logic
      can be deprecated and instead leverage the new interface in the
      TaxReturnService described in step 1

-  ☐ Migrate the SubmissionEvent table to either:

   -  ☐ Add a single rejection_codes column with a JSON type that can
      persist JSON that mirrors StatusResponseBody.rejectionCodes; or
   -  ☐ a 1:M join between SubmissionEvent and RejectionCodes (identical
      to Completed and Error today in the Status service
      e.g. AcknowledgementService.java#L441

-  ☐ Modify the status-change SQS message payload to include Errors such
   that all information contained in a StatusResponseBody is included in
   the SQS message and can be persisted in the Backend database
-  ☐ When consuming SQS message payloads, persist rejectionCodes
   appropriately into the SubmissionEvent or RejectionCodes table (as
   decided above). After the data is persisted to the database, cache
   the results as a submissionId:StatusResponseBody key-value pair in
   Redis.
-  ☐ Modify the TaxReturnService.getStatus in TaxReturnService.java#L793
   to:

   -  ☐ First, query for the latest submission ID of the tax return and
      use this ID as a key to check Redis to see if there is a
      corresponding StatusResponseBody value

      -  ☐ Cache hit: return the StatusResponseBody value to the client

      -  ☐ Cache miss: either due to TTL expiration or the return hasn’t
         been received/acknowledged by MeF. Check the database using

         ``TaxReturnService.getLatestSubmissionEventByTaxReturnIdPreferringAcceptedSubmissions``

         -  ☐ If the status is accepted/rejected , construct a
            StatusResponseBody payload from combination of the
            SubmissionEvent status (+ RejectionCode if applicable) and
            return it to the client

            -  ☐ If status is anything else, the tax return hasn’t been
               sent/received by MeF and the appropriate
               StatusResponseBody is ``pending`` .

-  ☐ Deprecate all Controllers and internal APIs in the Status service.
   Goodbye!

Solution 2 Implementation Proposal
==================================

-  ☐ Add a new API to the AcknowledgementController in
   AcknowledgementController.java#L45 that accepts a single submission
   ID instead of a tax return ID. This API will be similar to the
   current ``get()`` method within the Controller, except that it will
   have a different query pattern that will look for the most recent
   submission of a tax return to just looking for the submission itself
   via the submission Id.

   -  ☐ Logic around handling cases where a submission is both accepted
      and rejected so remain in place (i.e. we should always return
      accepted if a duplicate condition exists)
   -  ☐ NOTE: An alternative here is to change the current Status
      service API to only accept submission IDs (which can be easily
      accommodated by the Backend as described below) and then expose an
      internal API in the backend ``getMostRecentSubmission`` that the
      State API service calls before calling the ``status`` endpoint to
      fetch the status of the latest submission and check if the return
      can be exported

-  ☐ Convert the TaxReturnService.getStatus in
   TaxReturnService.java#L793 to query for the latest submission ID of
   the tax return. Before making calling the internal status endpoint,
   the backend first checks Redis to see if there is a key-value latest
   submission Id-AcknowledgementStatus pair exists.

   -  ☐ If a cache hit, return the AcknowledgementStatus response to the
      client without making a call to the Status service
   -  ☐ If a cache miss, make a HTTP request to the Status service
      ``/status`` endpoint to fetch the AcknowledgementStatus, cache the
      results and return the result to the client

-  ☐ When an Acknowledgement is received within the Status service,
   update the Redis cache with the accepted/rejected status

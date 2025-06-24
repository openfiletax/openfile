Date: 12/23
### Introduction

The concept of a tax return has recently evolved with the introduction of the concept of a resubmission. Whereas in the one-shot submission case we could assume a linear progression of data, with resubmissions we are faced with non-linear and cyclical progressions of tax return throughout the various services, effectively repeating the submission process until we receive an accepted status.

### Objectives

- Define a database schema for the backend database that enables **painless, scalable and future-proofed** tracking of the entire submission lifecycle at the database level with **minimal future migrations and backfills**.
- Minimize the number of unnecessary changes (migrations, backfills) 
- We don't fundamentally know what we will need from a data storage perspective at this moment in time, so we should approach it from the standpoint of 'better be safe than sorry' for the pilot. We might store more data than we need if everything goes well, but if things don't go well we will be happy that we have the data laying around.

### Why make more changes to the `backend` schema

Upon further requirement gathering and edge cases cropping up, it appears that the schema changes we initially agreed to previously isn't going to scale well in the long term. Specifically, I don't believe that, based on said the #3562 schema changes, we could reliably reconstruct the history of a taxpayers journey through DF if they have to resubmit their return given our current models or describe what events happened at what time in said journey. Reconstructing the history from the data/backend perspective is a business requirement in my mind (for a variety of reasons) and should be solved pre-launch. As a result, I think we need to evolve our data modeling of the `TaxReturn` object and its relations a bit more to capture the domain we are after.

To be clear, this is less driven by our need to enable analytic at the database level (that is covered elsewhere). Rather, it is around modeling submission, tax returns, and status changes in a way that uplevels our observability into a taxpayer's journey through DF from a backend perspective. Even though we will likely not have access to production read-replicas for the pilot, we should still have an observable system with clean architecture.

### Why not make the minimally viable set of changes now and wait until after the pilot to make more changes

1. _As soon as we start populating our production database, the cost of making changes in the future is orders of magnitude higher than making them now._ In other words, if we don't make changes now but realize we need to make changes in June 2024, we now have to worry about taxpayer data loss as a consequence of executing migrations and backfills incorrectly.
2. In prod-like environments, I presume that we should not, if not cannot, pull taxpayer data from S3 (XML) or decrypt encrypted data (factgraph) to answer questions about a taxpayer's journey through DF. This would violate compliance firewalls on many levels and I assume that we should not rely on these avenues.
3. Aside from wanting better observability as we roll out in Phase 1-2 to give us confidence, from an incident response standpoint we need a way to break the glass and run SQL queries against the prod db if we are in trouble, even if that means asking a DBA on EOPS/IEP to make the query for us. In the event/when that this happens, those queries should be performant, simple and easier for a larger audience to understand without deep technical knowledge of our system. As described below, cleaner data modeling with a limited number of mutable fields makes analysis much easier
4. Our analytics integration (with whatever acronym'd platform we are going with these days) will land TBD in Q1/Q2 2024, assuming it lands on time. This means that if we need to run baseline reporting before we can access the analytics platform, we will need to do it at the database level based on whatever schema we decide on.
5. We haven't actually made meaningful changes to the backend database that populate data into tables in a new way. This means that any future changes to the codebase or database are still, effectively, net new and wouldn't require us to refactor work we just implemented.

### Current Schema Design

Our original implementation of the backend schema model system only contained the `TaxReturn` model. See Original Schema image in description.

The most recent iteration proposed in #3562 used a combination of `TaxReturn` with a new 1:M relation to an event-tracking model `TaxReturnSubmission` as follows (the mental model of how this works is described here ("Epic: Resubmit Return After Rejection"). See 'Interim Schema originally agreement upon in resubmission epic scoping' image in description.

After some more research into resubmissions and discussions with various team members working on related work, I believe that the above combination of `TaxReturn` and `TaxReturnSubmission` is still insufficient in themselves to achieve what we want. While we could handle both of these concerns at the `TaxReturnSubmission` level, this would result in 1) a model that begins to drift away from its original purpose, namely to track status change events through DirectFile; 2) a model that needs to replicate a bunch of data each time we want to create a new event (such as facts and return headers) without any discernible value; and 3) a model that begins to combine mutability (session time tracking) with immutability (status logging). For instance, if a taxpayer spent 20 minutes on the original submission and 5 minutes correcting errors and resubmitting, we should be able to attribute 20 minutes to the original submission and 5 to the correction, rather than having a single 25 minute field that cannot be attributed to the original or correction session. We cannot do this right now.


### Schema Proposal

See Proposed Schema in description

We move to a schema definition that more neatly decouples mutable data and immutable data by:

1. Remove the `submit_time` column from the `TaxReturn`.
2. Rename `TaxReturnSubmission` to  `Submission` but maintain the M:1 relationship to `TaxReturn`.  The `Submission` table is meant as a map between a single tax return and all the submissions that comprise the journey from creation to completion (ideally acceptance). Each `Submission` for a given `TaxReturn` maps to a snapshot of various data, most importantly the facts and return headers, when the /submit endpoint is called.As a result, we should add a `facts` column to the table, similar to the data definition `TaxReturn`. The key difference for these two fields is that the data stored on the `Submission` table is  immutable and represents our archival storage of the facts and returns headers at a single moment in time (submission). When a new submission ocurs, we create a new `Submission` record to track this data, and copy the related `TaxReturn's` `facts` onto the `Submission`.
3. Add a `SubmissionEvent` model that FKs to `Submission`. The sole purpose of the `SubmissionEvent` model is to track status changes in our system, thereby function as an append-only audit log of events (effectively a write ahead log that we can use to play back the history of a submission from the standpoint of our system). Any immutable data corresponding to a status change event should live on this model. The statuses will be broader than MeF statuses alone.

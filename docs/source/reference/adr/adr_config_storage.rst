ADR: Configuration Storage
==========================

DATE: 12/08/2022

Where should the configuration live, how can we ensure that it is
version controlled, and what does a change process look like? At a
minimum the change process should include the time and date of the
change, the user who changed it, and a note from the user indicating why
they made the change. A more advanced system would have sign offs that
are also recorded. These actual configuration, and the changes to the
configuration should be stored in git, but this may not be the best tool
for disseminating changes out to containers running our software. For
that we will need an accessible system that meets or exceeds our SLO.
The focus of this document is how to store the data in such a way that
it is made available to every container effectively, including audit
systems, editing systems, and the tax engine itself.

Decision
--------

We should store the configuration of the tax rules in S3/a document
store. The basic pathing will look something like the following:

::

   /{schema-version}/
   /{schema-version}/config1.xml
   /{schema-version}/config2.xml
   /{schema-version}/justification/
   /{schema-version}/justification/justification.xml

The justification is the who, what, when, where, and why of the change.

Rationale
---------

We need a highly available method of updating n containers in m
availability zones. We haven’t set any SLOs yet, but money is on them
being pretty tight. We need something that can be updated easily, and
that won’t require any downtime to make an update. We will want to do a
schema version validating as part of a system health check, but that
should be part of a normal health check! It could be stored in the
database with the tax information, if we do indeed go that route, but it
seems like extra work to mash all of the config into a blob when there
is no reason to do so. They are documents and should be in a document
store.

Rejected ideas
--------------

on local storage/in container storage
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This is the easiest option, and what we used for the prototype, but it
would be unwieldy at scale. The update process for the schema would
require a bit of downtime as we knock the containers down and bring them
back up with the new configuration. There are other ways around that,
like supplying it through an endpoint, but that would require
verification and be a whole mess. #### shared disk storage This isn’t a
bad option for how to deal with the tax rules schema changes, but there
is a concern of people directly changing it. Even if it is somehow
secured and safe through another piece of software, tracking who changed
it, when, and why, it would still represent a single point of failure in
the system. There are mitigations for this, but what it starts to look
like is a document storage system, which is what this ADR suggests. ####
blob storage Blob storage could work for this, but it might be a bit
awkward. If the configuration breaks up into multiple files, we could
mash them all into one and store them in the blob, but that isn’t as
clean as keeping the documents separate. This approach does have the
benefit of keeping the signoff and the reasoning behind it together.

Assumptions
-----------

Config is documents
~~~~~~~~~~~~~~~~~~~

This seems like a solid assumption, but it might not be! I am having a
hard time imagining something else, but maybe there is something.

We need high availability
~~~~~~~~~~~~~~~~~~~~~~~~~

We believe that the tax system can’t go down during tax season. This
seems like a really safe bet. It can basically be spun down for months
out of the year, but once the season starts, this has to be on all the
time and working.

We will have multiple application instances
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

I feel like this is something we should plan for, but hey, maybe I am
wrong! I think that it would make sense for us to run several instances
of the tax engine behind a load balancer so that we can make sure that
it can handle the scale.

Regular disk storage is unreliable/unworkable
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This assumption comes from not trusting file system watchers, and being
concerned about disks in general. It feels like a potential point of
failure to hook a shared disk to a container (imagining both running in
AWS). There could be issues with the disk, with the connection to it,
maybe it gets tampered with (not sure how)… I just trust databases more
than a disk (I know they are on disks). I like the automatic backup
schedules, the order, and the ability to see and track what is going on.
This may just be a prejudice that I am bringing to the table. I trust
document stores more than just disk storage. All of the pathing above
could be used on a regular disk.

Constraints
-----------

-  The medium should be protectable in some way, meaning not just anyone
   can write and read.
-  The medium should be available to many systems.
-  The medium can meet auditing requirements (reads and writes are
   tracked in some way).

Status
------

Pending

Consequences
------------

TODO: fill this in when we start seeing consequences!

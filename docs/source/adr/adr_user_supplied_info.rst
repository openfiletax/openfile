ADR: Data Storage
=================

DATE: 12/21/2022

Background
----------

Our system will utilize and produce several kinds of data in its normal
operation, each of which need to be considered when discussing storage.
The categories are as follows: 1. **User Information**: We plan to use
one or more third party authentication providers to provide verification
of a user’s claimed or proved identity. Those users will have
preferences and personal information that our system will need. Although
some of that information may be stored by the authentication provider,
we will ask for it ourselves to avoid IAL2 identity proofing burdens. 2.
**Unfiled Tax Information**: The goal of our system is to produce or
file a tax return. To get to the point of filing or producing a tax
return, a user will be asked a series of questions that will drive our
system’s ability to fill in the form(S) provided by the IRS. The answers
to these questions must be stored and updated. 3. **Filed Tax
Information**: When the user is ready, our system must offer them a
method by which they may file their tax return. This could be either
through the MeF or by mailing it a PDF. Our system must maintain the
artifacts it creates for the period required by the agency. They should
also be stored with information that would allow us to replicate the
system they were run on, meaning version numbers for all software and
schemas involved. 4. **Tax Software Schema Information**: The system
asks a series of questions and collects information from the user. The
questions asked and the structure by which the data is understood must
be stored and versioned. In the initial version of the product we used
configuration for both the question flow and the facts that were
answered by the questions. We imagine something similar will be
necessary. 5. **Permissions**: A user may have access to multiple years
of returns, as well as returns filed by someone else on their behalf. In
the first year, it may be required for multiple people to use the same
account to file jointly. After the first year however, we may want to
allow multiple accounts to view the same return and sign independently.
We can also imagine a scenario where someone helps another person file
taxes, or maybe needs access to previous years for another person in
order to help them file this year. The implication is a sort of
permission system which is out of scope for this document.

These general categories constitute the basic data that our system will
use and generate. The decisions on how to store these pieces of
information and how we came to those decisions are the subject of this
document.

Decision
--------

The decisions here are going to be put in technology neutral terms,
referring to general categories of systems rather than by specific brand
names. Each of the categories above are handled differently in our
system. 1. **User Information**: We expect that a minimum of data will
come to us from the authentication provider. We will need to ask the
user for most of the necessary personal information and store it
ourselves. We will use a relational database table to store the ID from
the authentication provider, the type of authentication provider
(i.e. the name of the service), an ID specific to our system, and the
necessary personal information. User preferences will be stored in the
relational database as either a blob or as a table. 2. **Unfiled Tax
Information**: A blob in the system’s relational database is our
preferred approach to handling information on which the user is actively
working. 3. **Filed Tax Information**: A document storage system outside
of the system’s relational database is how we feel that this data should
be stored. 4. **Tax Software Schema Information**: This can be stored in
either a document store or in the relational database. It is slightly
preferred to keep the schema in the relational database as it will allow
for metadata storage and easier querying. 5. **Permissions**: The
permissions on tax returns will be stored in the relational database.

Rationale
---------

User Information
~~~~~~~~~~~~~~~~

To receive personal information from authentication providers, we would
have to burden users with IAL2 identity proofing requirements. In order
to avoid this, we will ask users to provide the information, and store
it ourselves.

By storing information about the user that the auth system also stores,
we will make it difficult for the user to anticipate behaviors between
the two systems. One can imagine the frustration scenario of updating
your information in our system with the expectation that it will be
updated in the auth provider (why would I need to update it twice?). The
opposite direction is equally annoying. Why didn’t you just pull my
information from the auth provider rather than making me update it in
your system as well?

We will need to mitigate these impacts with careful messaging and
communications.

Our use of a database table to store the user information linkage into
our system is partly out of necessity and party convenience. We would
like a unified ID internal to our system that connects users to tax
records. Also, we don’t want to be reliant on any particular third party
auth provider. Beyond these two concerns, we would also like to not lock
the user into a specific email address. There are a few ways to meet
these requirements, like, for example, linking the records by PII. We
felt that using PII would not be in the best interest of the user. There
are conditions under which a users most sensitive PII, like their social
security number, may change, whereas the ID they were assigned in the
third party auth system will not change. The third party ID approach
will also make it far more difficult to identify a user by their user
record.

The user preferences are not of substantial concern. They do not require
encryption, and they do not represent any real load on the system. Most
likely they will be a set of key value pairs that represent how a user
would like to see the site.

**Key Ideas** - We don’t want to burden users with meeting IAL2 identity
proofing requirements. - We don’t want to lock our users into an email.
- We don’t want to lock ourselves into a third party auth vendor. - We
don’t want to use PII which might change to identify records. - We would
like an internal ID to identify users and their records that are unique
to our system.

Unfiled Tax Information
~~~~~~~~~~~~~~~~~~~~~~~

There are several complexities that storing the active tax data in a
blob solves. The first is that it doesn’t lock us into using either
snapshots or deltas. In a document storage context it would be easier to
wipe out the old document and write a new one each time the user
updates. This could be countered with an event/command sourcing pattern,
which would then require us to validate each message is received,
processed and stored. The easiest way to allow for either update concept
is to use a JSON blob. If we are given new key value pairs, we simply
have to apply them to the blob. If we want to wipe out the whole blob
and rewrite it, we easily can.

The next important value is atomicity. Anything we do in the database
can be done in a transaction if necessary, allowing us to roll back if
there are any problems. The same could not be said if the data is stored
in a document storage system elsewhere. Imagine, for example, that we
would like to store the last updated time on the document. We could
perform that update in our database, and then attempt to write the
document to the document storage system only to have it fail. We now
have a belief in our database, that the record was updated at time X,
that is false. This isn’t good. This same action could create broken
links in the system.

Storing the information outside of the database requires extra hops. If
the information is linked but stored in another document storage system,
we will still have to go to the database to read the link and find the
document. This means that rather than doing one database read we will
have to do one read on the relational database and one on the document
store. From an efficiency standpoint, this is a bad idea.

The data we are planning to store is not so large as to cause a problem
for any common RDBMS provider. There won’t be any particular slowdown or
read issues associated with reading the data out of the database.

The final point is around single points of failure in the system. We can
architect around having the database be a single point of failure in our
system: there are a lot of tools to avoid that being a problem (like
replication/failovers for example). If our database system does go
completely down, our system will go down as well. Introducing another
system doesn’t solve that problem, and it in fact compounds the problem.
Now we are reliant on two systems not going down rather than one. The
likelihood of either going down is fairly low, but we have doubled our
chances of trouble if we move any “active” data out of our database.

**Key Ideas** - No lock in with respect to snapshot vs deltas -
Relational database operations are atomic, and can be rolled back on
failure - Storing data in multiple systems is less efficient as we will
have to jump multiple times to get the data. - Our data is not too large
for efficient database storage. - We already have the database as a
failure point, why add more?

Filed Tax Information
~~~~~~~~~~~~~~~~~~~~~

The information generated around filing are PDF(s) showing the tax form
as we have filled it out, the information we sent to the MeF, a copy of
the data used to generate the form, and some information about the
version of the system and the schemas used to file. This is read-only
information meant to be a record of what was submitted to the IRS (which
may also be helpful if we ever have to audit our system).

The first, obvious point is that these are mostly documents. The PDFs in
particular are definitely files that can and should be stored as files.
We don’t know upfront the total number of documents that may be
required. We can imagine that we will smash all the pdfs potentially
required into one large pdf, but even if we do that there could be other
documents that are necessary to retain. The uncertainty around the
number and the size of these documents makes a document storage system a
logical choice.

The fact that they are read only also helps inform the decision. Having
them in a separate system that doesn’t have a write capacity in the
normal functioning of the system, except on filing, makes them safer
from potential bugs that could cause a write to the wrong file. One
could imagine for instance, a user is actively working, files, and then
goes back to change something because they want to see if it will be
reflected in their taxes. It is unlikely, but a bug could be introduced
that updates the field data in the database. The extra level of
protection is not necessary, but is an added benefit.

**Key Ideas** - The artifacts are documents and should be treated like
documents. - We don’t know how many potential artifacts we are dealing
with. - These are read only, and having them separated helps to make
that more clear and avoids potential bugs.

Tax Software Schema Information
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Either solution is acceptable in this context. We have a slight
preference to storing it in the database so that some meta information
can be stored with the schema. In the future we may want to change
logging, marking the who, what, when, where, and why. It would be nice
if we could also have the deltas of the change stored in a field nearby
the schema.

If there is ever a need to query the schemas, maybe to show the change
over time of a specific fact, it would be easier if they were in the
relational database.

**Key Ideas** - Either system would work. - There are some advantages to
storing the information in the relational database - Able to add meta
info to relational database table easier - If we ever want to perform a
query on this information the relational data will make that easier

Permissions
~~~~~~~~~~~

The permissions are applied to both the filed tax information and the
active tax information. Because the active tax information is stored in
the relational database, it is logical to store the permissions there as
well. It wouldn’t make sense to store the permissions elsewhere. The
system relied on the relational database for general operation. If the
document storage system went offline, it would be possible to continue
operation, either without filing or with a queued filing system in
place. If the permissions were in another location we would lose this
property.

**Key Ideas** - Permissions apply to the data in the relational system
and the document store - The system should still be able to operate
without the document store, which means that permissions should be in
the relational database - Why would we store it away from the user’s
active data?

Rejected ideas
~~~~~~~~~~~~~~

Assumptions
~~~~~~~~~~~

-  User preferences are not of significant concern in terms of data
   storage.

Third party user IDs are
^^^^^^^^^^^^^^^^^^^^^^^^

Constraints
~~~~~~~~~~~

-  We need a storage system that meets any SLO we may have.
-  The system has to be widely understood and available. It shouldn’t be
   something that contractors won’t know.
-  The system can scale without a bunch of management.

Status
------

Pending

Consequences
------------

-  Our UI will have to communicate to users that data entry does not
   update their personal information in a third party auth system.

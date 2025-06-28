Database migration management
=============================

Written: August 17, 2023

Background
----------

Direct File database schema changes are presently handled by Hibernate’s
auto DDL and run automatically at application start. This is simple and
easy for early development efforts and can handle many database
migrations automatically. Modifying an ``@Entity``-annotated class is
all that is necessary to make most schema changes, even destructive ones
(depending on configuration).

As Direct File matures and approaches testing and eventual production
usage, we must be more careful about changes to the database schema and
take steps to reduce the likelihood of unintended changes. One way to do
this is to integrate a tool that supports evolutionary database design.

Required features
~~~~~~~~~~~~~~~~~

-  Allow separation of database changes and code changes
-  Easily determine what changes will happen when migrations are applied
-  Allow database changes to be applied separately from application
   start
-  Easily determine the current migration revision of the database
-  Allows migration to a specified revision which may not be the newest

Evaluation criteria
~~~~~~~~~~~~~~~~~~~

-  Integrates with Java tooling
-  Integrates into code review process
-  Allows separation of privileges for database users
-  Ideally, already available in IRS artifact repository

Options considered
------------------

While there are many tools available for managing migrations that could
work for Direct File, there are two that rise to the top due to their
extensive usage and ubiquity in Java-based applications. They are
`Liquibase <https://www.liquibase.org/>`__ and
`Flyway <https://flywaydb.org/>`__.

Each of these meets the requirements for use by Direct File.

Liquibase
~~~~~~~~~

-  All migrations in a single file
-  There is a choice of file format (YAML, XML, etc) and individual
   migrations can be specified directly as SQL or in a database-agnostic
   format.
-  Easy to view all migrations and determine the order they will execute
-  Requires coordination between developers for concurrent development
   of migrations
-  Database changelog can get large and unwieldy over time
-  Already available in IRS artifact repo (both ``liquibase-core`` and
   ``liquibase-maven-plugin``)

Flyway
~~~~~~

-  Migrations split into multiple files
-  Each migration is SQL
-  Potentially easier to concurrently add migrations, but still requires
   coordination between developers for concurrent development of
   migrations
-  Possibly more difficult to follow the flow of migrations
-  Already available in IRS artifact repo (both ``flyway-core`` and
   ``flyway-maven-plugin``)

Recommendation
--------------

Liquibase

Direct File is relatively small and should remain that way for some
time. As the system has begun to grow, additional purpose-specific small
services have been added. Those may have their own associated data
stores, keeping the complexity of any single database limited.

Liquibase’s single-file migration changelog will make it simple to view
existing migrations and the low complexity of our database will mean the
changelog should not grow out of control.

Decision
--------

Direct File will use Liquibase.

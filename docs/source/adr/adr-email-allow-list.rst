Email Allow List for Phase A of Pilot Rollout
=============================================

Date: 12/28/2023

Status
------

Complete

Context
-------

For the Phase A launch which will be invite-only internal, around 1/29 -
early February, we need to restrict access to Direct File using an email
allow list. We will be provided a CSV of emails that will need to be
checked by Direct File before allowing users to start their tax return.
Users will need to authenticate via SADI/ID.me and once they arrive at
Direct File, we need to check their SADI email address against our allow
list. If the email is not on the allow list, the user should see an
error message. The Direct File team does not have access to change
anything in PROD, so we will use the following process to coordinate
with TKTK, the IRS team who manages the PROD environment.

Requirements
~~~~~~~~~~~~

-  Handle ~100s of emails on an allow list
-  Accounts on the email allow list get access to Direct File in Phase A
-  Accounts not on the email allow list see an error message when they
   try to go to Direct File
-  Email allow list needs to be able to be updated WITHOUT a Prod code
   deployment

Background
~~~~~~~~~~

The current plan for identifying Direct File pilot users for Phase A: 1.
An email will be sent to IRS Employees asking for interest in
participating in the Direct File pilot 1. IRS Employees will tell us
which email to use for the allow list (most likely via email) 1. We
recommend using personal email, but we can’t be sure someone hasn’t
already used their IRS email to sign up for IRS Online Account, and
don’t want to ban them from using DF 1. We’ll collect those emails and
turn them into a .csv for the allow list 1. Employees will be able to
use Direct File on campus and during work hours, using IRS machines
(some of these employees may not have home computers or modern cell
phones)

Decision
--------

Email Allow list
~~~~~~~~~~~~~~~~

-  There will be less than 1,000 emails on the email allow list
-  The email allow list will be saved in the ``artifact-storage`` S3
   bucket already used by DF backend for storing PDF files
-  The format of the email allow list when loaded into S3 will be a CSV
   of HMAC hashed normalized email addresses and a DF seed in order to
   prevent plaintext emails to be read

   -  The DF seed will be used for both

      1. Hashing the email addresses in the CSV file and
      2. By the DF application to check whether a logged in user is in
         the email allow list

   -  Emails will be normalized by performing the following
      transformations in order:

      1. Convert to lower case
      2. Trim any leading or trailing spaces

-  We will update the ``users`` DB to store a new column representing
   whether or not the user is allowed to access the application. We will
   also use this column to determine whether a user is allowed in phase
   C, separate ADR to follow

   -  The alternative to having a DB record for this was to call the
      SADI PII service every time which risks creating downstream
      impacts for SADI

Direct File Implementation
~~~~~~~~~~~~~~~~~~~~~~~~~~

-  Set up an environment variable ``enforce-email-allow-list`` to
   control whether we will enforce the email allow list in each
   environment.
-  DF Backend app checks environment variable for email allow list. If
   it is ON, continue:
-  On a regular time interval, say every ``15 minutes``, DF backend poll
   S3 for an updated email allow list file:

   -  If it exists, then load emails into memory
   -  If the file does not exist, deny all access

-  The email allow list contains HMAC hashed email addresses, so DF
   backend will need to load the user’s SADI email and hash it using
   ``HMAC (seed + lowercase(email))`` to compare it to values on the
   email allow list
-  For every request to DF backend, check whether the user is allowed

   -  Check whether user already exists in the DB

      -  If yes: Check the access granted column to see if the user has
         been allowed

         -  If yes: allow access to DF as normal
         -  If no: backend should respond with a 403 error code with
            custom message, which the frontend will turn into a
            user-friendly message

      -  If no: Check the hashed SADI email against the allow list

         -  If yes: mark the access granted column as true for the user
         -  If no: mark the access granted column as false. If the user
            has been previously allowed, we do not change the access
            from true to false

-  A code deployment is needed in order to turn off the email allow list
   and move to the next phase (controlled availability)

Encrypting taxpayer artifacts
=============================

Date: 08/21/2023

Status
------

Approved

Context
-------

Our system stores taxpayer artifacts in object storage (AWS S3). These
artifacts include files like PDFs of completed tax returns and XML
bundles for submission to the Modernized e-File (MeF) system that
contain sensitive taxpayer data in the form of personally identifiable
information (PII) and federal tax information (FTI).

AWS S3 provides server-side encryption to protect the contents of
objects on disk. However, anyone with access to the S3 bucket is able to
view the plaintext contents of files. To mitigate the impact of a breach
or leak—e.g., a misconfiguration resulting in public access to the S3
bucket or improper file handling by administrators—we want an approach
that provides an additional layer of encryption to sensitive files prior
to their storage.

Decision
--------

We will use `Amazon S3 Encryption
Client <https://docs.aws.amazon.com/amazon-s3-encryption-client/latest/developerguide/what-is-s3-encryption-client.html>`__
to encrypt taxpayer artifacts containing sensitive information before
storing them in object storage. This aligns with `our decision to use S3
for all artifact storage <adr_taxpayer_artifact_storage.md>`__.

We will configure the client to use a symmetric AES-GCM 256-bit wrapping
key that is created and managed by AWS Key Management Service (KMS). The
client library will use this wrapping key as part of an `envelope
encryption
scheme <https://docs.aws.amazon.com/amazon-s3-encryption-client/latest/developerguide/concepts.html#envelope-encryption>`__
for encrypting each artifact with a unique data key. The wrapping key
will be used only for artifact storage, allowing these encryption and
decryption operations to be auditable independently from other KMS
operations throughout the system.

Consequences
------------

-  We use an open-source, actively maintained encryption library that
   limits the need for custom implementation of cryptographic details
-  The envelope encryption approach used by the library is conceptually
   similar to our chosen approach for column-level encryption
-  If needed, we can use this same library for `encrypting the content
   of messages sent to our
   queues <https://aws.amazon.com/blogs/developer/encrypting-message-payloads-using-the-amazon-sqs-extended-client-and-the-amazon-s3-encryption-client/>`__
-  We already utilize many AWS services and libraries, and as such this
   decision does not expand the list of third-party providers we rely
   on. Conversely, this further couples our implementation to AWS; if we
   move to a new cloud provider we will need to identify a suitable
   replacement library.
-  We can further minimize overhead by enabling automatic key rotation
   on the wrapping key in AWS KMS
-  Developers must use this library exclusively when storing and
   retrieving taxpayer artifacts containing sensitive information
-  Plaintext taxpayer artifacts will not be readily available for
   debugging and troubleshooting. We will need to plan additional
   features for this functionality and ensure they are implemented in
   ways that support operational needs without undermining our security
   and privacy posture.
-  `Additional
   configuration <https://docs.aws.amazon.com/amazon-s3-encryption-client/latest/developerguide/features.html#multipart-upload>`__
   may be necessary if we store files greater than 100MB

Resources
---------

-  `ADR for storing artifacts in
   S3 <docs/adr/adr_taxpayer_artifact_storage.md>`__
-  `Amazon S3 Encryption
   Client <https://docs.aws.amazon.com/amazon-s3-encryption-client/latest/developerguide/what-is-s3-encryption-client.html>`__

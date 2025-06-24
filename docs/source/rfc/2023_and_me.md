Engineering decisions to be made early in the Dec 2022 - Spring 2023 development push
===========================

Background:

As we prepare to build a tax filing service, engineering decisions need to be made on a vast array of topics ranging from the overall architecture to language choices to hosting platforms to deployment tools. Some of these choices can be easily changed as the team grows and requirements evolve, while others will have high switching costs and put us on a path that will be hard to deviate from. The goal of this document is to identify the areas that are in greatest need of thoughtful treatment early in the process, so that we can prioritize them accordingly. Also provided are some initial thoughts on likely directions, associated tradeoffs, and a brief list of the things we need to know in order to proceed with a given choice.

Insight on each topic area should take into consideration our expectations about what skill sets we'll likely have available, what tools we can get authorization to use, and any lessons that can be derived from the prototype that was built in spring/summer 2022.

Topics:
* Division of responsibilities between front end and back end
* Modularization of back end (API for front end interaction? separation of MeF integration?)
* Language choices
* Front end web frameworks
* Data storage product
* Definition of a user account 
* Authentication levels and tools
* Rough expectations for document ingest features and resulting dependencies
* Rough expected scope of Taxpert interface support and resulting dependencies
* Rough expectations for integration with third party customer support tool / CRM


Division of responsibilities between front end and back end
===========================

Modularization of back end (API for front end interaction? separation of MeF integration?)
===========================

Language choices
===========================

Front end web frameworks
===========================

Data storage product
===========================
* what are we storing?
* how long do we need to store it?
* what are the security requirements?



Definition of a user account
===========================

For joint filers, we need to make a choice as to whether a user account represents an individual human or the joint filing couple. There are examples of services in which this determination can be made independently by each user (for example, I may choose to share an email account with my spouse), but in our case, identity is a crucial concept that needs to be well defined with respect to user accounts.

Considerations:
* Handling access and information history from year to year as people change filing statuses and become married/unmarried.
* Future data prepopulation features that may require identity proofing.


Authentication levels and tools
===========================

We believe that, at least up through and including filing season 2024 (TY2023), we will: 
* Allow taxpayers to provide data
* Pass back information from the IRS indicating whether returns are accepted or rejected
We will NOT grant users access to any sensitive tax data that they have not explicitly provided to the application.

For this set of features, we contend that the application must support similar levels of authentication as existing non-government applications which access the MeF API. It is important for users to demonstrate that they have the access keys (e.g. username, password, MFA methods) that were defined in any previous sessions during which they provided data, but it is not necessary to prove that they are a particular human.
Therefore, IAL1 is appropriate, while IAL2 is not.

In future years when we provide mechanisms to ingest data from sources other than user input, authentication should be enhanced to accommodate the data access restrictions appropriate for those data sources. Examples may include:
* SSO or password authentication for financial institutions
* IAL2 identity proofing for access to personal tax data held by the IRS


Rough expectations for document ingest features and resulting dependencies
===========================

Assumption: Initial scope does not include any automated ingestion of documents like W-2s, so we do not expect to rely on OCR libraries or similar.

Rough expected scope of Taxpert interface support and resulting dependencies
===========================

Assumption: Tax rules and logic for combining fields needs to be editable by people who are not software engineers.

Rough expectations for integration with third party customer support tool / CRM
===========================




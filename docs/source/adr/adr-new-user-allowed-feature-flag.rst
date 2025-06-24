# New Users Allowed Feature Flag for Phase C of Pilot Rollout
Date: 1/17/2024

## Status
Complete

## Context
For the Phase C launch which will be controlled availability (and Phase D launch of limited availability), we want to limit **when** new users have access to Direct File and **how many** new users can access Direct File. 

### Requirements
- Allow new users to access Direct File during short open windows or when the max number of new users has been reached during an open window
    - Max number of new users will be in the hundreds or thousands
- The open windows will be brief, for example a 2-hour period that is defined the day before, and will be unnanounced
- Outside of the open windows, no new users will be allowed to use Direct File
- Outside of the open windows, users who were previously allowed will be able to use Direct File as normal
- Users and emails who were previously allowed during the Phase A email allow list launch should still be allowed during Phase C
    - If users are ON the allowlist, they are always allowed regardless of max total users
    - If users are NOT on the allowlist, their access will be granted if and only if the open enrollment window is open and max users haven't been reached
- When we approach Phase D, all of the above requirements apply, except the open windows will be slightly longer, such as 1 week
- Closing a window needs to happen within 20 minutes of the IRS decision to close. We will need to coordinate with TKTK to meet this SLA.

## Decision

### Use a config file in S3 as our feature flags
Use a JSON file in S3 for Direct File feature flags that does not require a deployment to update.

#### Config File
- The JSON file will only contain feature flag variables that apply everywhere in the DF application starting with the following 2 flags for phase C. No PII will be included.
    - `new-user-allowed`: boolean representing whether we are in an open window and new user accounts are allowed
    - `max-users`: int representing how many max allowed users there can be in Direct File currently. This is a failsafe to prevent mass signups before the open window can be closed. This would be calculated by checking the number of rows in `users` where allowed is `true` before opening a window and adding the max number of new accounts we would like to allow in the open window. This does not need to be exact, stopping the creation of new accounts roughly around `max-users` is good enough

### Direct File Implementation
- Set up new default config JSON files `feature-flags.json` to store our feature flags, and additional config files per environment
- DF Backend app polls for the config file every `1 minute` to pick up changes and load the file into memory
- For every request to DF backend, check whether the user is allowed:
    - Check whether user already exists in the `users` DB
        - If yes the user exists: Check the allowed column to see if the user has been allowed
            - If true: allow access to DF as normal
            - If false:
                - If `new-user-allowed` is true and `max-users` > count of records in `users` where `allowed = true`: set allowed to true for this user
                - Else, respond with a 403 error code and a custom meessage 
        - If no the user does not exist: Check feature flags and email allow list
            - If `new-user-allowed` is true and `max-users` > count of records in `users` where `allowed = true`: set allowed to true for this user and allow the user access to Direct File
            - Else if hashed SADI email matches an email in the email allow list: set allowed to true and allow the user access to Direct File
            - Else, respond with a 403 error code and a custom message
- A code deployment is needed in order to update the feature flags

### Updating the feature flag file
1. DF Backend PM will file an ticket with the updated config file. In the ticket, request to upload the new file to `artifact-storage` S3 in the correct environment
1. A turnaround time of 5 minutes or less is expected
1. DF backend will pick up the changes in the next poll for the new file to S3

## Other Options Considered

1. Store config values as DB record and have a TKTK dba run a DB query in PROD
1. Use a secrets manager? Parameter store?
1. Usie a real feature flag service so that business users could change them in a UI – long term solution

We decided to use a config file approach due to the ease of setting it up and familiarity with the design and update process given the Phase A decision
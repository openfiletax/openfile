# Direct File State Tax API

## Quick Start

### Local Development

This project relies on locally installed Maven packages in order to build; therefore, you can run the `/scripts/build-project.sh` which will install the shared dependencies

```sh
../../scripts/build-project.sh
```

### Docker

To build state-api image, run

```
docker compose build state-api
```

To quickly set up the application and run the supporting services (localstack, db), run the following command:

```bash
docker compose up state-api -d
```

The `state-api` application will be accessible at http://localhost:8081, and the PostgreSQL database will be available on port 5433 with the default username and password `postgres`.

Health check: http://localhost:8081/actuator/health
Swagger API:  http://localhost:8081/swagger-ui/index.html

## Database migrations

This app uses the same Liquibase setup as the [backend](../backend) app.
See the [backend README section for database migrations for more details](../backend/README.md#database-migrations).

## Endpoints

### Save Authorization Code

Save the provided JSON data to the database.

**Endpoint:** `/state-api/authorization-code`

**Sample Data:**
Ensure value of stateCode is in state_profie table
```json
{"taxReturnUuid": "4638655a-5798-4174-a5a0-37cc3b3cd9a0", "tin": "123456789", "taxYear": 2022, "stateCode":"FS", "submissionId":"12345678901234567890"}
```

**cURL Command:**
```bash
curl -X POST -H "Content-Type: application/json" -d '{"taxReturnUuid": "4638655a-5798-4174-a5a0-37cc3b3cd9a0", "tin": "123456789", "taxYear": 2022, "stateCode":"FS", "submissionId":"12345678901234567890"}' http://localhost:8081/state-api/authorization-code -i
```

### V2: Generate New Authorization Token

Get a [JWT](https://jwt.io/) with symmetrically-encrypted metadata for future (time-limited) access to
the V2 tax return export.

**Endpoint:** `state-api/v2/authorization-token`

### Export Tax Return Data

Retrieve tax return data based on provided headers.

**Endpoint:** `/state-api/export-return`

The request includes a JWT Bearer token signed with a private key, containing the state account ID and authorization code. Export an encrypted tax return for a particular taxpayer identified by the authorization code passed in the JWT Bearer token. If the operation is successful, it will return a status of 200. In case of an error, it will also return a status of 200 along with an error code, such as,

```
E_BEARER_TOKEN_MISSING
E_AUTHORZIATION_CODE_NOT_EXIST
E_AUTHORIZATION_CODE_EXPIRED
E_AUTHORIZATION_CODE_INVALID_FORMAT
E_ACCOUNT_ID_NOT_EXIST
E_JWT_VERIFICATION_FAILED
E_CERTIFICATE_NOT_FOUND
E_CERTIFICATE_EXPIRED
E_INTERNAL_SERVER_ERROR
```

Success return:
```
{
  "status": "success",
  "taxReturn": "encoded-encrypted-data"
}
```

encrypted taxReturn includes return status and xml data, submissionId, directFileData, and status can be "accepted", "rejected", "pending". Sample value:
    {
        "status": "accepted",
        "submissionId": "123456",
        "xml": "return-data in xml",
        "directFileData": "JSON formatted data collected by direct file"
    }

Error return:
```
{
   "status": "error",
   "error": "E_CERTIFICATE_EXPIRED"
}
```

Testing using cURL alone may not be straightforward. We recommend using Postman for this purpose.

PostMan setting:

GET http://localhost:8081/state-api/export-return

```
Authorization: select JWT Bearer

   Algorithm: RS256
   Private Key: copy content from src/test/resources/certificates/fakestate.key and paste here
   Payload: {"iss":"123456","sub":"cd19876a-328c-4173-b4e6-59b55f4bb99e","iat":1516239022} where "iss" for account-id, "sub" for authorization code, and "iat" is value of time.time() without quotes. Ensure value of "sub" is in authorization_code table.

   Header Prefix: Bearer

```
## Cleanup

When you're finished using the application, you can tear it down with the following command:

```bash
docker compose down
```

## Clean Start up on localhost
```
1. docker compose down
2. docker container prune (select y)
3. docker compose build
4. delete docker/db/data folder (if you are not the first to run)
5. docker compose up -d
```
endpoints:
 http://localhost:8081/state-api/authorization-code
 http://localhost:8081/state-api/v2/authorization-token
 http://localhost:8081/state-api/export-return

## Integration Tests
Make sure all dependent docker containers up running locally before doing the integration tests.
The State API app itself should not be running. The test class will spin up a properly configured instance on demand.
```
 mvn test -DrunIntegrationTests -Dtest=StateApiAppTest
or
./integrationtest.sh
```
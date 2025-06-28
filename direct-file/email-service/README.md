# Direct File Email Service

This service is responsible for reading from a queue, generating emails, and sending mail to a SMTP relay.

## Quick Start

### Local Development

2. This project relies on locally installed Maven packages in order to build; therefore, you can run the 
`direct-file/scripts/build-project.sh` script, which will install the shared dependencies.

    ```sh
    INSTALL_MEF=0 ../../scripts/build-project.sh
    ```

### Docker

To build and run the Email Service, run the following from `/direct-file`

```bash
docker compose up -d email-service
```

## Testing by adding a message to the queue

A sample message that can be used for these tests is:

```json
{
   "accepted": [
      {
         "to": "accept1@example.com",
         "languageCode": "en"
      },
      {
         "to": "accept2@example.com",
         "languageCode": "en"
      }
   ],
   "rejected": [
      {
         "to": "reject1@example.com",
         "languageCode": "en"
      },
      {
         "to": "reject2@example.com",
         "languageCode": "en"
      }
   ]
}
```

### Locally with localstack

By default, the service is configured to use a black hole email service which writes a log message instead of actually sending email. Update the `SPRING_PROFILES_ACTIVE` in `docker-compose.yaml` if you need to verify/test with one of the other `ISendService` implementations.

```sh
docker compose up -d --build
# in one shell
docker compose logs --follow email-service
# in another
awslocal sqs send-message \
    --queue-url http://sqs.us-west-2.localstack:4566/000000000000/send-mail \
    --message-body file://./email_message.json
```

Upon handling, log messages will be printed to the console.  Note the use of `BlackholeSendService`.

```
direct-file-email-service  | 2023-11-28T18:34:16.992Z  INFO 1 --- [hedulerThread-1] g.i.d.e.l.SendEmailMessageQueueListener  : Received a send mail request for test@example.com
direct-file-email-service  | 2023-11-28T18:34:16.993Z  INFO 1 --- [hedulerThread-1] g.i.d.e.services.BlackholeSendService    : email sent to test@example.com
```

### Locally with Spring Boot Maven plugin
#### Configuration
Active Profiles:
* `debug` &mdash; [See Debugging](#debugging)
* `blackhole`
#### Instructions

1. Start LocalStack
```sh
docker compose up -d localstack
```
2. Start email-service

```sh
./mvnw spring-boot-:run
```

or use the following to specify different active profiles

```sh
./mvnw spring-boot:run -Dspring-boot.run.profiles=<?debug>,<blackhole|send-email>
```
#### Debugging

`application-debug.yaml`
* enables all Spring Boot Actuator endpoints
* unmasks values for 
    * http://localhost:8080/actuator/env
    * http://localhost:8080/actuator/configprops

##### Tips

Disable/rename `/src/main/resources/logback.xml` to reenable Spring Boot console log formatting

### Spot Bugs
For notes and usage on spotbugs see the [Backend API README Spot Bugs section](../backend/README.md#spot-bugs)
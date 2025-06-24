#!/bin/bash

echo LOCALSTACK SETUP
TAX_RETURN_BUCKET_NAME=direct-file-taxreturns
OPERATIONS_JOBS_BUCKET_NAME=operations-jobs
STATE_CERT_BUCKET_NAME=cert-bucket
EDP_BUCKET_NAME=edp-bucket
BPMS_BUCKET_NAME=bpms-bucket
REGION=us-west-2
SUBMIT_ROLE=submit
BACKEND_ROLE=backend
ACCESS_KEY=accessKey
SECRET_KEY=secretKey
aws configure set aws_access_key_id $ACCESS_KEY
aws configure set aws_secret_access_key $SECRET_KEY
aws configure set default.region $REGION

echo CREATING SNS TOPICS
submission_confirmation_topic_arn=$(awslocal sns create-topic --name 'submission-confirmation-topic' --output text)
status_change_topic_arn=$(awslocal sns create-topic --name 'status-change-topic' --output text)

echo CREATING SQS QUEUES/SUBSCRIPTIONS
# Initializes a queue, optionally with a destination DLQ, subscription to an SNS topic, and a subscription DLQ.
# See https://aws.amazon.com/blogs/compute/designing-durable-serverless-apps-with-dlqs-for-amazon-sns-amazon-sqs-aws-lambda/
# for more information and a diagram of an example infrastructure.
# Arguments:
# $1 = queue name
# $2 = destination DLQ name (optional)
# $3 = topic ARN for subscription (optional)
# $4 = subscription DLQ name (optional)
init_queue() {
  # Create the main SQS queue
  echo "Creating queue '$1'"
  local queue_url
  queue_url=$(awslocal sqs create-queue --queue-name "$1" --output text)

  # Create the destination DLQ if provided
  if [ -n "$2" ]
  then
    echo "Creating destination DLQ '$2'"
    local destination_dlq_url
    destination_dlq_url=$(awslocal sqs create-queue --queue-name "$2" --output text)

    # Example of how to set up a destination DLQ redrive policy locally if desired:
    # echo "Establishing redrive policy to link queue '$1' to destination DLQ '$2'"
    # local destination_dlq_arn destination_redrive_policy
    # destination_dlq_arn=$(awslocal sqs get-queue-attributes --queue-url "$destination_dlq_url" --attribute-names QueueArn --query 'Attributes' --output text)
    # destination_redrive_policy="{\"RedrivePolicy\": \"{\\\"deadLetterTargetArn\\\":\\\"$destination_dlq_arn\\\",\\\"maxReceiveCount\\\":\\\"2\\\"}\"}"
    # awslocal sqs set-queue-attributes --queue-url "$queue_url" --attributes "$destination_redrive_policy"
  fi

  # If a topic ARN is given, have the SQS queue subscribe to it
  if [ -n "$3" ]
  then
    echo "Subscribing queue '$1' to topic '$3'"
    local queue_arn subscription_arn
    queue_arn=$(awslocal sqs get-queue-attributes --queue-url "$queue_url" --attribute-names QueueArn --query 'Attributes' --output text)
    # Turning on RawMessageDelivery to receive the message only (without any SNS metadata).
    # See https://docs.aws.amazon.com/sns/latest/dg/sns-large-payload-raw-message-delivery.html
    subscription_arn=$(awslocal sns subscribe --topic-arn "$3" --protocol sqs --notification-endpoint "$queue_arn" --attributes RawMessageDelivery=true --output text)

    # If a subscription DLQ is given, create it
    if [ -n "$4" ]
    then
      echo "Creating subscription DLQ '$4'"
      local subscription_dlq_url
      subscription_dlq_url=$(awslocal sqs create-queue --queue-name "$4" --output text)

      # Example of how to set up a subscription DLQ redrive policy locally if desired:
      # echo "Establishing redrive policy to link subscription '$subscription_arn' to subscription DLQ '$4'"
      # local subscription_dlq_arn subscription_redrive_policy
      # subscription_dlq_arn=$(awslocal sqs get-queue-attributes --queue-url "$subscription_dlq_url" --attribute-names QueueArn --query 'Attributes' --output text)
      # subscription_redrive_policy="{\"deadLetterTargetArn\":\"$subscription_dlq_arn\"}"
      # awslocal sns set-subscription-attributes --subscription-arn "$subscription_arn" --attribute-name RedrivePolicy --attribute-value "$subscription_redrive_policy"
    fi
  fi
}

init_queue 'dispatch-queue' 'dlq-dispatch-queue'
init_queue 'pending-submission-queue' 'dlq-pending-submission-queue' "$submission_confirmation_topic_arn" 'dlq-pending-submission-subscription'
init_queue 'send-mail' 'dlq-send-mail'
init_queue 'status-change-queue' 'dlq-status-change-queue' "$status_change_topic_arn" 'dlq-status-change-subscription'
init_queue 'submission-confirmation-queue' 'dlq-submission-confirmation-queue' "$submission_confirmation_topic_arn" 'dlq-submission-confirmation-subscription'
init_queue 's3-notification-event-queue' 'dlq-s3-notification-event-queue'
init_queue 'data-import-request-queue' 'dlq-data-import-request-queue'
init_queue 'data-import-result-queue' 'dlq-data-import-result-queue'

echo CREATING TAX RETURNS BUCKET
awslocal s3api create-bucket \
	--bucket $TAX_RETURN_BUCKET_NAME \
	--object-lock-enabled-for-bucket \
    --create-bucket-configuration LocationConstraint=$REGION

echo ADDING TEST SUBMITTED TAX RETURNS
awslocal s3 cp /etc/localstack/init/ready.d/sample-tax-return.xml s3://$TAX_RETURN_BUCKET_NAME/2022/taxreturns/ae019609-99e0-4ef5-85bb-ad90dc302e70/submissions/55664244000012345678.xml
awslocal s3 cp /etc/localstack/init/ready.d/sample-tax-return.xml s3://$TAX_RETURN_BUCKET_NAME/2022/taxreturns/be019609-99e0-4ef5-85bb-ad90dc302e70/submissions/65664244000012345678.xml
awslocal s3 cp /etc/localstack/init/ready.d/sample-tax-return.xml s3://$TAX_RETURN_BUCKET_NAME/2022/taxreturns/ce019609-99e0-4ef5-85bb-ad90dc302e70/submissions/75664244000012345678.xml

echo CREATING OPERATIONS JOBS BUCKET
awslocal s3api create-bucket \
	--bucket $OPERATIONS_JOBS_BUCKET_NAME \
	--object-lock-enabled-for-bucket \
    --create-bucket-configuration LocationConstraint=$REGION

echo CREATING STATE CERT BUCKET
awslocal s3api create-bucket \
  --bucket $STATE_CERT_BUCKET_NAME \
  --object-lock-enabled-for-bucket \
      --create-bucket-configuration LocationConstraint=$REGION

echo ADDING FAKE STATE CERTS
awslocal s3 cp /etc/localstack/init/ready.d/fakestate.cer s3://$STATE_CERT_BUCKET_NAME/fakestate.cer
awslocal s3 cp /etc/localstack/init/ready.d/fakestate_expired.cer s3://$STATE_CERT_BUCKET_NAME/fakestate_expired.cer
awslocal s3 cp /etc/localstack/init/ready.d/fakestate.cer s3://$STATE_CERT_BUCKET_NAME/direct-file-test-state.cer

echo ADDING FEATURE FLAGS JSON FILE
awslocal s3 cp /etc/localstack/init/ready.d/feature-flags.json s3://$TAX_RETURN_BUCKET_NAME/feature-flags.json

awslocal s3api create-bucket \
  --bucket $EDP_BUCKET_NAME \
  --object-lock-enabled-for-bucket \
      --create-bucket-configuration LocationConstraint=$REGION

awslocal s3api create-bucket \
  --bucket $BPMS_BUCKET_NAME \
  --object-lock-enabled-for-bucket \
      --create-bucket-configuration LocationConstraint=$REGION

echo CREATING ROLES
awslocal iam create-role --role-name $SUBMIT_ROLE --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "ec2.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}'
awslocal iam create-role --role-name $BACKEND_ROLE --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "ec2.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}'

awslocal iam create-policy --policy-name submit-policy --policy-document file:///etc/localstack/policies/submit-role.json
awslocal iam create-policy --policy-name backend-policy --policy-document file:///etc/localstack/policies/backend-role.json

# TODO: need to be able to assume the application roles before disallowing all access outside of those roles to resources
# e.g. before we disallow root access to the bucket, we need to be able to assume the application roles.
# awslocal s3api put-bucket-policy --bucket $TAX_RETURN_BUCKET_NAME --policy file:///etc/localstack/policies/bucket.json

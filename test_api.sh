#!/bin/bash

# Test the /api/chat endpoint
# Replace the URL with your Vercel deployment URL

URL="https://project-1-skillflow-basic-chatbot-kledh2942.vercel.app/api/chat"

curl -X POST "$URL" \
  -H "Content-Type: application/json" \
  -H "User-Agent: test-client" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "What is SkillFlow-AI?"
      }
    ]
  }'


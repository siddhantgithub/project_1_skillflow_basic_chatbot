#!/usr/bin/env python3
"""
Test script for the /api/chat endpoint
"""

import requests
import json

# Replace with your Vercel deployment URL or use localhost for local testing
# PRODUCTION_URL = "https://project-1-skillflow-basic-chatbot-kledh2942.vercel.app/api/chat"
LOCAL_URL = "http://localhost:3000/api/chat"

def test_chat_endpoint(url, message="What is SkillFlow-AI?"):
    """Test the chat endpoint with a simple message."""
    
    payload = {
        "messages": [
            {
                "role": "user",
                "content": message
            }
        ]
    }
    
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "test-client"
    }
    
    print(f"Testing endpoint: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}\n")
    
    try:
        response = requests.post(url, json=payload, headers=headers, stream=True)
        
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}\n")
        
        if response.status_code == 200:
            print("Response (streaming):")
            print("-" * 50)
            for line in response.iter_lines():
                if line:
                    decoded_line = line.decode('utf-8')
                    print(decoded_line)
            print("-" * 50)
        else:
            print(f"Error Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    import sys
    
    # Use command line argument for URL if provided
    if len(sys.argv) > 1:
        url = sys.argv[1]
    else:
        url = LOCAL_URL
    
    # Use command line argument for message if provided
    if len(sys.argv) > 2:
        message = sys.argv[2]
    else:
        message = "What is SkillFlow-AI?"
    
    test_chat_endpoint(url, message)


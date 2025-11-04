# Implementation Guide - Adding Company Context to Chatbot

This guide shows all the code changes needed to complete the learning assignment:
1. Inject company context at inference time
2. Refuse non-company questions with helpful suggestions

---

## Overview of Changes

You need to modify **2 files**:
1. `api/index.py` - Add context loading logic
2. `api/utils/stream.py` - Inject system prompt with context

---

## Change 1: Create Context Loading Function

**File:** `api/index.py`

**Add this new function** (after the imports, before the app initialization):

```python
import os
from pathlib import Path

def load_company_context() -> str:
    """Load company context from the markdown file."""
    context_path = Path(__file__).parent / "context" / "company.md"
    
    if context_path.exists():
        with open(context_path, "r", encoding="utf-8") as f:
            return f.read()
    else:
        return "No company context available."
```

**Why:** This function reads the `api/context/company.md` file and returns its contents as a string.

---

## Change 2: Update the Chat Endpoint

**File:** `api/index.py`

**Current code (lines 29-39):**
```python
@app.post("/api/chat")
async def handle_chat_data(request: Request, protocol: str = Query('data')):
    messages = request.messages
    openai_messages = convert_to_openai_messages(messages)

    client = OpenAI(api_key=oidc.get_vercel_oidc_token(), base_url="https://ai-gateway.vercel.sh/v1")
    response = StreamingResponse(
        stream_text(client, openai_messages, TOOL_DEFINITIONS, AVAILABLE_TOOLS, protocol),
        media_type="text/event-stream",
    )
    return patch_response_with_headers(response, protocol)
```

**Change to:**
```python
@app.post("/api/chat")
async def handle_chat_data(request: Request, protocol: str = Query('data')):
    messages = request.messages
    openai_messages = convert_to_openai_messages(messages)
    
    # Load company context
    company_context = load_company_context()

    client = OpenAI(api_key=oidc.get_vercel_oidc_token(), base_url="https://ai-gateway.vercel.sh/v1")
    response = StreamingResponse(
        stream_text(client, openai_messages, company_context, TOOL_DEFINITIONS, AVAILABLE_TOOLS, protocol),
        media_type="text/event-stream",
    )
    return patch_response_with_headers(response, protocol)
```

**What changed:**
- Added `company_context = load_company_context()` to load the context
- Passed `company_context` as a parameter to `stream_text()`

---

## Change 3: Update stream_text Function Signature

**File:** `api/utils/stream.py`

**Current function signature (lines 12-18):**
```python
def stream_text(
    client: OpenAI,
    messages: Sequence[ChatCompletionMessageParam],
    tool_definitions: Sequence[Dict[str, Any]],
    available_tools: Mapping[str, Callable[..., Any]],
    protocol: str = "data",
):
```

**Change to:**
```python
def stream_text(
    client: OpenAI,
    messages: Sequence[ChatCompletionMessageParam],
    company_context: str,
    tool_definitions: Sequence[Dict[str, Any]],
    available_tools: Mapping[str, Callable[..., Any]],
    protocol: str = "data",
):
```

**What changed:**
- Added `company_context: str` parameter after `messages`

---

## Change 4: Create System Prompt with Context

**File:** `api/utils/stream.py`

**Add this code BEFORE the `stream = client.chat.completions.create(...)` call (around line 35):**

```python
        # Get model from environment variable, default to gpt-4o
        model = os.getenv("LLM_MODEL", "gpt-4o")
        
        # Create system prompt with company context
        system_prompt = f"""You are a helpful customer support assistant for SkillFlow-AI Client.

Your role is to answer questions ONLY about SkillFlow-AI Client using the company information provided below.

IMPORTANT RULES:
1. ONLY answer questions related to SkillFlow-AI Client (products, pricing, policies, support, etc.)
2. If a question is NOT about SkillFlow-AI Client, politely refuse and suggest company-related topics
3. Use the company context below to provide accurate, helpful answers
4. Be friendly, professional, and concise
5. If you don't know something about the company, say so - don't make up information

COMPANY CONTEXT:
{company_context}

---

When refusing non-company questions, use this format:
"I'm here to help with questions about SkillFlow-AI Client. I can assist you with:
• Our products and pricing plans
• Account and billing questions
• Course information and learning paths
• Technical support

What would you like to know about SkillFlow-AI Client?"
"""

        # Inject system prompt at the beginning of messages
        messages_with_context = [
            {"role": "system", "content": system_prompt},
            *messages
        ]

        stream = client.chat.completions.create(
            messages=messages_with_context,  # Changed from 'messages' to 'messages_with_context'
            model=model,
            stream=True,
            tools=tool_definitions,
        )
```

**What changed:**
- Created a `system_prompt` that includes:
  - The company context
  - Instructions to only answer company questions
  - Instructions on how to refuse non-company questions
  - Suggested topics to redirect users
- Created `messages_with_context` that prepends the system message
- Changed `messages=messages` to `messages=messages_with_context` in the API call

---

## Complete Modified Files

### File 1: `api/index.py` (Complete)

```python
from typing import List
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi import FastAPI, Query, Request as FastAPIRequest
from fastapi.responses import StreamingResponse
from openai import OpenAI
from .utils.prompt import ClientMessage, convert_to_openai_messages
from .utils.stream import patch_response_with_headers, stream_text
from .utils.tools import AVAILABLE_TOOLS, TOOL_DEFINITIONS
from vercel import oidc
from vercel.headers import set_headers
import os
from pathlib import Path


load_dotenv(".env.local")

app = FastAPI()


def load_company_context() -> str:
    """Load company context from the markdown file."""
    context_path = Path(__file__).parent / "context" / "company.md"
    
    if context_path.exists():
        with open(context_path, "r", encoding="utf-8") as f:
            return f.read()
    else:
        return "No company context available."


@app.middleware("http")
async def _vercel_set_headers(request: FastAPIRequest, call_next):
    set_headers(dict(request.headers))
    return await call_next(request)


class Request(BaseModel):
    messages: List[ClientMessage]


@app.post("/api/chat")
async def handle_chat_data(request: Request, protocol: str = Query('data')):
    messages = request.messages
    openai_messages = convert_to_openai_messages(messages)
    
    # Load company context
    company_context = load_company_context()

    client = OpenAI(api_key=oidc.get_vercel_oidc_token(), base_url="https://ai-gateway.vercel.sh/v1")
    response = StreamingResponse(
        stream_text(client, openai_messages, company_context, TOOL_DEFINITIONS, AVAILABLE_TOOLS, protocol),
        media_type="text/event-stream",
    )
    return patch_response_with_headers(response, protocol)
```

### File 2: `api/utils/stream.py` (Modified section only)

**Lines 12-42 should become:**

```python
def stream_text(
    client: OpenAI,
    messages: Sequence[ChatCompletionMessageParam],
    company_context: str,
    tool_definitions: Sequence[Dict[str, Any]],
    available_tools: Mapping[str, Callable[..., Any]],
    protocol: str = "data",
):
    """Yield Server-Sent Events for a streaming chat completion."""
    try:
        def format_sse(payload: dict) -> str:
            return f"data: {json.dumps(payload, separators=(',', ':'))}\n\n"

        message_id = f"msg-{uuid.uuid4().hex}"
        text_stream_id = "text-1"
        text_started = False
        text_finished = False
        finish_reason = None
        usage_data = None
        tool_calls_state: Dict[int, Dict[str, Any]] = {}

        yield format_sse({"type": "start", "messageId": message_id})

        # Get model from environment variable, default to gpt-4o
        model = os.getenv("LLM_MODEL", "gpt-4o")
        
        # Create system prompt with company context
        system_prompt = f"""You are a helpful customer support assistant for SkillFlow-AI Client.

Your role is to answer questions ONLY about SkillFlow-AI Client using the company information provided below.

IMPORTANT RULES:
1. ONLY answer questions related to SkillFlow-AI Client (products, pricing, policies, support, etc.)
2. If a question is NOT about SkillFlow-AI Client, politely refuse and suggest company-related topics
3. Use the company context below to provide accurate, helpful answers
4. Be friendly, professional, and concise
5. If you don't know something about the company, say so - don't make up information

COMPANY CONTEXT:
{company_context}

---

When refusing non-company questions, use this format:
"I'm here to help with questions about SkillFlow-AI Client. I can assist you with:
• Our products and pricing plans
• Account and billing questions
• Course information and learning paths
• Technical support

What would you like to know about SkillFlow-AI Client?"
"""

        # Inject system prompt at the beginning of messages
        messages_with_context = [
            {"role": "system", "content": system_prompt},
            *messages
        ]

        stream = client.chat.completions.create(
            messages=messages_with_context,
            model=model,
            stream=True,
            tools=tool_definitions,
        )

        # Rest of the function remains the same...
```

---

## Testing Your Implementation

### Test Case 1: Company Question (Should Answer)
**User:** "What are your pricing plans?"

**Expected Response:** Should provide details about Free, Pro ($29.99/month), Teams, and Mentorship plans.

### Test Case 2: Company Question (Should Answer)
**User:** "How do I cancel my subscription?"

**Expected Response:** Should explain that you can cancel anytime from account settings and mention the 14-day refund policy.

### Test Case 3: Non-Company Question (Should Refuse)
**User:** "What's the weather in Paris?"

**Expected Response:** Should refuse politely and suggest company-related topics like:
"I'm here to help with questions about SkillFlow-AI Client. I can assist you with:
• Our products and pricing plans
• Account and billing questions
..."

### Test Case 4: Non-Company Question (Should Refuse)
**User:** "Who won the Super Bowl?"

**Expected Response:** Should refuse and redirect to company topics.

### Test Case 5: Edge Case
**User:** "Tell me about your AI technology"

**Expected Response:** Should answer based on company context (AI-powered learning paths, personalized recommendations, etc.)

---

## Summary of Changes

| File | Lines Changed | What Changed |
|------|---------------|--------------|
| `api/index.py` | Added imports, new function, modified endpoint | Added `os`, `Path` imports; created `load_company_context()`; passed context to `stream_text()` |
| `api/utils/stream.py` | Modified function signature and added system prompt | Added `company_context` parameter; created system prompt with context; injected system message |

**Total lines added:** ~60 lines  
**Total files modified:** 2 files  
**New files created:** 0 (context file already exists)

---

## Key Learning Points

1. **Context Injection:** Loading external data (markdown file) and passing it to the LLM
2. **System Prompts:** Using system messages to control LLM behavior
3. **Prompt Engineering:** Writing clear instructions for the LLM to follow
4. **Guardrails:** Implementing rules to constrain the chatbot's responses
5. **File I/O:** Reading files using Python's `pathlib` and file operations

---

## Optional Enhancements (Advanced)

If learners want to go further, they could:

1. **Add logging:** Log when non-company questions are asked
2. **Add metrics:** Track what types of questions users ask
3. **Improve refusal:** Use a separate LLM call to classify if question is company-related
4. **Cache context:** Load company context once at startup instead of every request
5. **Add examples:** Include few-shot examples in the system prompt
6. **Support multiple formats:** Allow YAML or JSON context files in addition to Markdown

---

*This implementation guide provides all the code changes needed to complete the assignment.*


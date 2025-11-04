import json
import logging
import os
import sys
import traceback
import uuid
from typing import Any, Callable, Dict, Mapping, Sequence

from fastapi.responses import StreamingResponse
from openai import OpenAI
from openai.types.chat.chat_completion_message_param import ChatCompletionMessageParam

# Configure logging for Vercel deployment
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)


def stream_text(
    client: OpenAI,
    messages: Sequence[ChatCompletionMessageParam],
    company_context: str,
    tool_definitions: Sequence[Dict[str, Any]],
    available_tools: Mapping[str, Callable[..., Any]],
    protocol: str = "data",
):
    """Yield Server-Sent Events for a streaming chat completion."""

    def format_sse(payload: dict) -> str:
        return f"data: {json.dumps(payload, separators=(',', ':'))}\n\n"

    message_id = f"msg-{uuid.uuid4().hex}"

    try:
        logger.info(f"Starting stream for message_id: {message_id}")
        logger.info(f"Protocol: {protocol}, Messages count: {len(messages)}")

        text_stream_id = "text-1"
        text_started = False
        text_finished = False
        finish_reason = None
        usage_data = None
        tool_calls_state: Dict[int, Dict[str, Any]] = {}

        yield format_sse({"type": "start", "messageId": message_id})

        # Get model from environment variable, default to gpt-4o
        model = os.getenv("LLM_MODEL", "gpt-4o")
        logger.info(f"Using model: {model}")

        # Validate inputs
        if not messages:
            logger.warning("Empty messages list received")
            yield format_sse({
                "type": "error",
                "error": "No messages provided"
            })
            return

        if not company_context:
            logger.warning("Empty company context received")
            company_context = "No company context available."

        # Create system prompt with company context
        system_prompt = f"""You are a helpful customer support assistant for \
SkillFlow-AI Client.

Your role is to answer questions ONLY about SkillFlow-AI Client using the \
company information provided below.

IMPORTANT RULES:
1. ONLY answer questions related to SkillFlow-AI Client (products, pricing, \
policies, support, etc.)
2. If a question is NOT about SkillFlow-AI Client, politely refuse and \
suggest company-related topics
3. Use the company context below to provide accurate, helpful answers
4. Be friendly, professional, and concise
5. If you don't know something about the company, say so - don't make up \
information

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
            *messages,
        ]

        logger.info(f"Creating chat completion stream with {len(tool_definitions)} tools")

        try:
            stream = client.chat.completions.create(
                messages=messages_with_context,
                model=model,
                stream=True,
                tools=tool_definitions,
            )
        except Exception as e:
            logger.error(f"Error creating OpenAI stream: {str(e)}", exc_info=True)
            yield format_sse({
                "type": "error",
                "error": f"Failed to create stream: {str(e)}"
            })
            raise

        chunk_count = 0
        for chunk in stream:
            chunk_count += 1
            if chunk_count % 10 == 0:
                logger.debug(f"Processed {chunk_count} chunks")

            try:
                for choice in chunk.choices:
                    if choice.finish_reason is not None:
                        finish_reason = choice.finish_reason
                        logger.info(f"Finish reason: {finish_reason}")

                    delta = choice.delta
                    if delta is None:
                        continue

                    if delta.content is not None:
                        if not text_started:
                            yield format_sse({"type": "text-start", "id": text_stream_id})
                            text_started = True
                        yield format_sse(
                            {
                                "type": "text-delta",
                                "id": text_stream_id,
                                "delta": delta.content,
                            }
                        )

                    if delta.tool_calls:
                        for tool_call_delta in delta.tool_calls:
                            index = tool_call_delta.index
                            state = tool_calls_state.setdefault(
                                index,
                                {
                                    "id": None,
                                    "name": None,
                                    "arguments": "",
                                    "started": False,
                                },
                            )

                            if tool_call_delta.id is not None:
                                state["id"] = tool_call_delta.id
                                if (
                                    state["id"] is not None
                                    and state["name"] is not None
                                    and not state["started"]
                                ):
                                    yield format_sse(
                                        {
                                            "type": "tool-input-start",
                                            "toolCallId": state["id"],
                                            "toolName": state["name"],
                                        }
                                    )
                                    state["started"] = True

                            function_call = getattr(tool_call_delta, "function", None)
                            if function_call is not None:
                                if function_call.name is not None:
                                    state["name"] = function_call.name
                                    if (
                                        state["id"] is not None
                                        and state["name"] is not None
                                        and not state["started"]
                                    ):
                                        yield format_sse(
                                            {
                                                "type": "tool-input-start",
                                                "toolCallId": state["id"],
                                                "toolName": state["name"],
                                            }
                                        )
                                        state["started"] = True

                                if function_call.arguments:
                                    if (
                                        state["id"] is not None
                                        and state["name"] is not None
                                        and not state["started"]
                                    ):
                                        yield format_sse(
                                            {
                                                "type": "tool-input-start",
                                                "toolCallId": state["id"],
                                                "toolName": state["name"],
                                            }
                                        )
                                        state["started"] = True

                                    state["arguments"] += function_call.arguments
                                    if state["id"] is not None:
                                        yield format_sse(
                                            {
                                                "type": "tool-input-delta",
                                                "toolCallId": state["id"],
                                                "inputTextDelta": function_call.arguments,
                                            }
                                        )

                if not chunk.choices and chunk.usage is not None:
                    usage_data = chunk.usage

            except Exception as chunk_error:
                logger.error(f"Error processing chunk {chunk_count}: {str(chunk_error)}", exc_info=True)
                # Continue processing other chunks
                continue

        if finish_reason == "stop" and text_started and not text_finished:
            yield format_sse({"type": "text-end", "id": text_stream_id})
            text_finished = True

        if finish_reason == "tool_calls":
            for index in sorted(tool_calls_state.keys()):
                state = tool_calls_state[index]
                tool_call_id = state.get("id")
                tool_name = state.get("name")

                if tool_call_id is None or tool_name is None:
                    continue

                if not state["started"]:
                    yield format_sse(
                        {
                            "type": "tool-input-start",
                            "toolCallId": tool_call_id,
                            "toolName": tool_name,
                        }
                    )
                    state["started"] = True

                raw_arguments = state["arguments"]
                try:
                    parsed_arguments = (
                        json.loads(raw_arguments) if raw_arguments else {}
                    )
                except Exception as error:
                    yield format_sse(
                        {
                            "type": "tool-input-error",
                            "toolCallId": tool_call_id,
                            "toolName": tool_name,
                            "input": raw_arguments,
                            "errorText": str(error),
                        }
                    )
                    continue

                yield format_sse(
                    {
                        "type": "tool-input-available",
                        "toolCallId": tool_call_id,
                        "toolName": tool_name,
                        "input": parsed_arguments,
                    }
                )

                tool_function = available_tools.get(tool_name)
                if tool_function is None:
                    yield format_sse(
                        {
                            "type": "tool-output-error",
                            "toolCallId": tool_call_id,
                            "errorText": f"Tool '{tool_name}' not found.",
                        }
                    )
                    continue

                try:
                    logger.info(f"Executing tool: {tool_name} with args: {parsed_arguments}")
                    tool_result = tool_function(**parsed_arguments)
                    logger.info(f"Tool {tool_name} executed successfully")
                except Exception as error:
                    logger.error(f"Tool {tool_name} execution failed: {str(error)}", exc_info=True)
                    yield format_sse(
                        {
                            "type": "tool-output-error",
                            "toolCallId": tool_call_id,
                            "errorText": str(error),
                        }
                    )
                else:
                    yield format_sse(
                        {
                            "type": "tool-output-available",
                            "toolCallId": tool_call_id,
                            "output": tool_result,
                        }
                    )

        if text_started and not text_finished:
            yield format_sse({"type": "text-end", "id": text_stream_id})
            text_finished = True

        finish_metadata: Dict[str, Any] = {}
        if finish_reason is not None:
            finish_metadata["finishReason"] = finish_reason.replace("_", "-")

        if usage_data is not None:
            usage_payload = {
                "promptTokens": usage_data.prompt_tokens,
                "completionTokens": usage_data.completion_tokens,
            }
            total_tokens = getattr(usage_data, "total_tokens", None)
            if total_tokens is not None:
                usage_payload["totalTokens"] = total_tokens
            finish_metadata["usage"] = usage_payload

        finish_event = {"type": "finish", "messageMetadata": finish_metadata} if finish_metadata else {"type": "finish"}
        logger.info(f"Sending finish event: {finish_event}")
        yield format_sse(finish_event)

        # Send message-finish event for AI SDK compatibility
        yield format_sse({"type": "message-finish", "messageId": message_id})

        logger.info(f"Stream completed successfully for message_id: {message_id}")
        logger.info(f"Total chunks processed: {chunk_count}")

        # Explicitly return to close the generator and terminate the function
        return

    except Exception as e:
        error_type = type(e).__name__
        error_msg = str(e)
        error_traceback = traceback.format_exc()

        logger.error(f"Stream error for message_id: {message_id}")
        logger.error(f"Error type: {error_type}")
        logger.error(f"Error message: {error_msg}")
        logger.error(f"Traceback:\n{error_traceback}")

        # Try to send error to client before raising
        try:
            yield format_sse({
                "type": "error",
                "messageId": message_id,
                "error": error_msg,
                "errorType": error_type
            })
        except Exception as yield_error:
            logger.error(f"Failed to yield error message: {str(yield_error)}")

        # Print to stderr for Vercel logs
        print(f"STREAM ERROR: {error_type}: {error_msg}", file=sys.stderr)
        print(error_traceback, file=sys.stderr)

        raise


def patch_response_with_headers(
    response: StreamingResponse,
    protocol: str = "data",
) -> StreamingResponse:
    """Apply the standard streaming headers expected by the Vercel AI SDK."""

    response.headers["x-vercel-ai-ui-message-stream"] = "v1"
    response.headers["Cache-Control"] = "no-cache"
    response.headers["Connection"] = "keep-alive"
    response.headers["X-Accel-Buffering"] = "no"

    if protocol:
        response.headers.setdefault("x-vercel-ai-protocol", protocol)

    return response

import json

import httpx

from app.config import LLM_PROVIDER, LLM_API_KEY, LLM_MODEL, LLM_BASE_URL


def _mock_chat(messages: list[dict]) -> str:
    last = messages[-1]["content"].lower()
    if "analyze" in last:
        return (
            "This product shows a declining production trend over the past several days. "
            "The deficit on the exception date follows lower output in preceding days, "
            "suggesting a sustained issue rather than a one-off dip. "
            "Possible root causes: machine downtime, raw material shortage, or staffing gaps. "
            "Recommendation: check maintenance logs and material inventory for this product line."
        )
    if "summary" in last:
        return (
            "Today's exception overview: there are several open items requiring attention, "
            "with a mix of high and medium severity. The average deficit indicates moderate "
            "underperformance. High-severity items should be prioritized for resolution. "
            "Overall, production is mostly on track but a few product lines need investigation."
        )
    if "translate" in last:
        return json.dumps({})
    return "No analysis available."


def _build_system_prompt(tool: str) -> str:
    prompts = {
        "analyze": (
            "You are a manufacturing analyst. Given an exception with product code, deficit percentage, "
            "severity, and its 7-day production trend, explain the likely root cause and recommend an action. "
            "Keep it concise (3-5 sentences)."
        ),
        "summary": (
            "You are a manufacturing analyst. Given summary statistics about production exceptions "
            "(total count, high/medium severity counts, open/acknowledged/resolved statuses, average deficit), "
            "write a brief 2-3 sentence daily summary for a plant manager."
        ),
        "translate": (
            "You are a query translator. Convert the user's natural language request into structured filter parameters. "
            "Respond with ONLY valid JSON matching this schema: "
            '{"product_code": string or null, "severity": "high" or "medium" or null, "date": string or null}. '
            "Use null for unspecified fields. Do not include any other text."
        ),
    }
    return prompts.get(tool, prompts["analyze"])


async def _call_openai(messages: list[dict]) -> str:
    headers = {
        "Authorization": f"Bearer {LLM_API_KEY}",
        "Content-Type": "application/json",
    }
    body = {
        "model": LLM_MODEL,
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": 500,
    }
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{LLM_BASE_URL}/chat/completions",
            headers=headers,
            json=body,
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]


async def _call_gemini(messages: list[dict]) -> str:
    system_msg = next((m for m in messages if m["role"] == "system"), None)
    user_msgs = [m for m in messages if m["role"] != "system"]

    contents = []
    for m in user_msgs:
        contents.append({
            "role": "user",
            "parts": [{"text": m["content"]}],
        })

    body = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 500,
        },
    }
    if system_msg:
        body["systemInstruction"] = {
            "parts": [{"text": system_msg["content"]}],
        }

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{LLM_MODEL}:generateContent?key={LLM_API_KEY}",
            headers={"Content-Type": "application/json"},
            json=body,
        )
        resp.raise_for_status()
        data = resp.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]


async def llm_chat(messages: list[dict], tool: str) -> str:
    system = {"role": "system", "content": _build_system_prompt(tool)}
    full = [system] + messages

    if LLM_PROVIDER == "mock":
        return _mock_chat(messages)

    if LLM_PROVIDER == "gemini":
        return await _call_gemini(full)

    return await _call_openai(full)

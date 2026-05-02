import os
import httpx

PROVIDER_ENV_KEYS = {
    "anthropic": "ANTHROPIC_API_KEY",
    "groq": "GROQ_API_KEY",
    "gemini": "GEMINI_API_KEY",
    "openai": "OPENAI_API_KEY",
    "deepseek": "DEEPSEEK_API_KEY",
}

PROVIDER_BASE_URLS = {
    "anthropic": "https://api.anthropic.com/v1",
    "groq": "https://api.groq.com/openai/v1",
    "gemini": "https://generativelanguage.googleapis.com/v1beta/openai",
    "openai": "https://api.openai.com/v1",
    "deepseek": "https://api.deepseek.com/v1",
}


class LLMError(Exception):
    """Raised when the LLM API returns an error."""

    def __init__(self, message, status_code=None):
        super().__init__(message)
        self.status_code = status_code


def call_llm(provider, model, prompt, temperature, api_key=None):
    if not api_key:
        api_key = os.getenv(PROVIDER_ENV_KEYS.get(provider, ""))

    if not api_key:
        raise LLMError(f"No API key found for provider '{provider}'.")

    base_url = PROVIDER_BASE_URLS.get(provider, "https://api.openai.com/v1")

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    }

    if provider == "anthropic":
        headers["anthropic-version"] = "2023-06-01"
        headers["x-api-key"] = api_key

    try:
        response = httpx.post(
            f"{base_url}/chat/completions",
            headers=headers,
            json={
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": temperature,
            },
            timeout=60.0,
        )
    except httpx.TimeoutException:
        raise LLMError(f"Request to {provider} timed out after 60 seconds.")
    except httpx.RequestError as e:
        raise LLMError(f"Network error when calling {provider}: {str(e)}")

    if response.status_code == 429:
        raise LLMError(
            f"Rate limit exceeded for {provider}. Please wait before retrying.",
            status_code=429,
        )
    elif response.status_code == 401:
        raise LLMError(f"Invalid API key for {provider}.", status_code=401)
    elif response.status_code == 402:
        raise LLMError(f"Insufficient credits for {provider}.", status_code=402)
    elif response.status_code >= 500:
        raise LLMError(
            f"{provider} server error ({response.status_code}). Try again later.",
            status_code=response.status_code,
        )
    elif not response.is_success:
        try:
            detail = response.json().get("error", {}).get("message", response.text)
        except Exception:
            detail = response.text
        raise LLMError(
            f"{provider} returned an error: {detail}", status_code=response.status_code
        )

    return response.json()["choices"][0]["message"]["content"]

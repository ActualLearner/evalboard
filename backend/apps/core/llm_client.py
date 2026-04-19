from litellm import completion
import os

PROVIDER_ENV_KEYS = {
    "anthropic": "ANTHROPIC_API_KEY",
    "groq": "GROQ_API_KEY",
    "gemini": "GEMINI_API_KEY",
    "openai": "OPENAI_API_KEY",
}


def call_llm(provider, model, prompt, temperature, api_key=None):
    if not api_key:
        api_key = os.getenv(PROVIDER_ENV_KEYS.get(provider, ""))

    response = completion(
        model=f"{provider}/{model}",
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature,
        api_key=api_key,
    )
    return response.choices[0].message.content

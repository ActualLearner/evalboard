from litellm import completion


def call_llm(provider, model, prompt, temperature, api_key):
    response = completion(
        model=f"{provider}/{model}",
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature,
        api_key=api_key,
    )
    return response.choices[0].message.content

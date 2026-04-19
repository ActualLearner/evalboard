def render_prompt(template: str, input_text: str) -> str:
    return template.replace("{{input}}", input_text)

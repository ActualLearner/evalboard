import re


def normalize(s: str) -> str:
    s = re.sub(r"[^\w\s]", "", s).strip().lower()
    s = re.sub(r"\s+", " ", s)
    return s


def exact_match(output: str, ideal: str) -> float:
    norm_output = normalize(output)
    norm_ideal = normalize(ideal)

    if norm_ideal == norm_output or norm_ideal in norm_output:
        return 1.0

    ideal_words = set(norm_ideal.split())
    output_words = set(norm_output.split())

    if not ideal_words:
        return 0.0

    matched_words = ideal_words & output_words
    partial_score = len(matched_words) / len(ideal_words)

    return round(partial_score, 4)

import re


def exact_match(output: str, ideal: str) -> float:
    def normalize(s):
        return re.sub(r"[^\w\s]", "", s).strip().lower()

    return 1.0 if normalize(output) == normalize(ideal) else 0.0

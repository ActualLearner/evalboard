def exact_match(output: str, ideal: str) -> float:
    return 1.0 if output.strip().lower() == ideal.strip().lower() else 0.0

import re
import unicodedata

def normalize_canonical_name(raw_name: str) -> str:
    """
    Normaliza o nome da peça para chave canônica anti-repetição:
    1. Remove espaços nas extremidades e colapsa múltiplos espaços internos em espaço simples.
    2. Remove acentuações e caracteres diacríticos (ex: 'Calça' -> 'calca', 'Óculos' -> 'oculos', 'Sutiã' -> 'sutia').
    3. Converte para minúsculas (lowercase).
    """
    if not raw_name:
        return ""
    # Strip e colapso de espaços
    cleaned = re.sub(r"\s+", " ", raw_name.strip())
    # Remoção de acentuação via NFKD
    nfkd = unicodedata.normalize("NFKD", cleaned)
    unaccented = "".join([c for c in nfkd if not unicodedata.combining(c)])
    return unaccented.lower()

def format_title_name(raw_name: str) -> str:
    """
    Formata o nome da mercadoria em Title Case limpo para exibição, preservando acentos:
    Ex: '  short   social  ' -> 'Short Social'
    """
    if not raw_name:
        return ""
    cleaned = re.sub(r"\s+", " ", raw_name.strip())
    return cleaned.title()

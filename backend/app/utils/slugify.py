import re
import uuid

def generate_article_slug(headline: str, article_id: uuid.UUID = None) -> str:
    # 1. Lowercase and strip leading/trailing spaces
    slug = headline.lower().strip()
    
    # 2. Replace non-alphanumeric characters with hyphens
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    
    # 3. Replace multiple spaces or hyphens with a single hyphen
    slug = re.sub(r'[\s-]+', '-', slug).strip('-')
    
    # 4. Truncate to maximum 80 characters to keep URLs clean
    slug = slug[:80].rstrip('-')
    
    # 5. Append short identifier to guarantee uniqueness
    suffix = str(article_id)[:6] if article_id else uuid.uuid4().hex[:6]
    return f"{slug}-{suffix}"

def detect_structure(para, index, doc=None):
    """Detect paragraph type. Bullet paragraphs are always 'bullet'."""
    text  = para.text.strip()
    words = text.split()
    wc    = len(words)

    if wc == 0:
        return 'empty'

    # Bullet list items — NEVER treat as heading regardless of bold
    if is_bullet_para(para):
        return 'bullet'
    
    # High Priority: The very first non-empty paragraph of a book is often the title/chapter name
    if index == 0 and wc <= 15:
        return 'chapter_title'

    if wc > 20:
        return 'body'

    is_bold = is_all_bold(para)
    orig_align = get_original_alignment(para)

    # Chapter detection (matches 'Chapter 8' or 'Chapter 8: Title' or common Hindi markers)
    chapter_regex = r'^(chapter|unit|part|section|lesson|adhyaay|\u0905\u0927\u094d\u092f\u093e\u092f|\u0907\u0915\u093e\u0908|\u092d\u093e\u0917)\s*([\dIVX]+)?'
    if re.match(chapter_regex, text.lower()) and wc <= 15:
        return 'chapter_title'

    if re.match(r'^\d+(\.\d+)*[\.\s]', text) and is_bold and wc <= 12:
        return 'subheading'

    if re.match(r'^[a-zA-Z]\)', text) and is_bold and wc <= 10:
        return 'subheading'

    if text.isupper() and wc < 8:
        return 'chapter_title'

    if index < 4 and wc < 8 and is_bold and not text.endswith('.'):
        return 'title'

    if is_bold and wc <= 15:
        return 'subheading'

    return 'body'

def allowed_file(filename: str, allowed_extensions: set) -> bool:
    """Check if the file extension is allowed."""
    if not filename:
        return False
    return "." in filename and filename.rsplit(".", 1)[1].lower() in allowed_extensions


def get_file_extension(filename: str) -> str:
    """Extract file extension from filename."""
    if "." in filename:
        return filename.rsplit(".", 1)[1].lower()
    return ""

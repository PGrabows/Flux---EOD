from pydantic import BaseModel, Field


class DocumentUploadSchema(BaseModel):
    filename: str = Field(..., max_length=255)
    file_size: int = Field(..., gt=0, le=16777216)  # 16 MB max


class DocumentUpdateSchema(BaseModel):
    document_number: str | None = Field(None, max_length=100)
    document_date: str | None = None  # ISO format date
    seller: str | None = Field(None, max_length=255)
    amount: float | None = None


class LoginSchema(BaseModel):
    username: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=1)


class CreateUserSchema(BaseModel):
    username: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=1)
    password: str = Field(..., min_length=8)


class AssignRoleSchema(BaseModel):
    role_id: str = Field(...)

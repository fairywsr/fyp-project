from fastapi import HTTPException, status


class AppError(HTTPException):
    def __init__(self, status_code: int, detail: str, code: str = "ERROR"):
        super().__init__(status_code=status_code, detail={"detail": detail, "code": code})


class UnauthorizedError(AppError):
    def __init__(self, detail: str = "Not authenticated", code: str = "UNAUTHORIZED"):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail, code=code)


class ForbiddenError(AppError):
    def __init__(self, detail: str = "Access denied for current role or scope", code: str = "FORBIDDEN"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail, code=code)


class NotFoundError(AppError):
    def __init__(self, detail: str = "Requested resource not found or outside your scope", code: str = "NOT_FOUND"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail, code=code)


class BadRequestError(AppError):
    def __init__(self, detail: str = "Bad request", code: str = "BAD_REQUEST"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail, code=code)


class DuplicateError(AppError):
    def __init__(self, detail: str = "Resource already exists or duplicate event dropped", code: str = "DUPLICATE"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail, code=code)

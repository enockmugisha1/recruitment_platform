from rest_framework import exceptions
from rest_framework_simplejwt.authentication import JWTAuthentication

# Endpoints a user on a temporary password may still call.
ALLOWED_WHILE_PASSWORD_CHANGE_PENDING = (
    '/auth/password/change',
    '/auth/logout',
    '/auth/me',
)


class PasswordChangeAwareJWTAuthentication(JWTAuthentication):
    """
    Normal JWT authentication, plus: a user who is still on the temporary
    password they were given (``must_change_password``) can do nothing except
    change that password, read their own account, or log out. This is
    enforced here on the server, not just by the frontend redirect, so the
    temporary credentials cannot be used to work around the change.
    """

    def authenticate(self, request):
        result = super().authenticate(request)
        if result is None:
            return None

        user, _token = result
        if getattr(user, 'must_change_password', False):
            path = request.path.rstrip('/')
            if not any(path.endswith(allowed) for allowed in ALLOWED_WHILE_PASSWORD_CHANGE_PENDING):
                raise exceptions.PermissionDenied({
                    'detail': 'You must change your temporary password before continuing.',
                    'code': 'password_change_required',
                })
        return result

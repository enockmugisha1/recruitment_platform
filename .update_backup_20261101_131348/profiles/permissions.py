from rest_framework.permissions import BasePermission

# Allows access only to users with the 'recruiter' role.
class IsRecruiter(BasePermission):
    message = "Permission denied because you are not authenticated or a recruiter." # Custom error message

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "recruiter"

    def has_object_permission(self, request, view, obj):
        if obj.user == request.user:
            return True
        return False

# Allows access only to users who are staff members.
class IsStaff(BasePermission):
    message = "Permission denied because you are not a staff." # Custom error message

    def has_permission(self, request, view):
        if request.user.is_authenticated and request.user.is_staff:
            return True
        return False

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        return False
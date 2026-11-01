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

# ThinkGreen Afrika staff who register companies and create their recruiters.
class IsBusiness(BasePermission):
    message = "Only the business account can do this."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "business")


# Any recruiter that belongs to a company.
class IsCompanyRecruiter(BasePermission):
    message = "You must be a recruiter linked to a company."

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated and user.role == "recruiter"):
            return False
        profile = getattr(user, "recruiter_profile", None)
        return bool(profile and profile.company_id)


# A recruiter who may manage their company's team.
class IsCompanyAdmin(IsCompanyRecruiter):
    message = "Only a company administrator can manage the team."

    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.recruiter_profile.is_company_admin

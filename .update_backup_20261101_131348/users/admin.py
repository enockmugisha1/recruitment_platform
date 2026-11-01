from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth import get_user_model
from django.utils.html import format_html
from django.utils import timezone
from .models import OTP

User = get_user_model()

@admin.register(User)
class MyUserAdmin(UserAdmin):
    list_display = [
        "email", "role", "full_name", "is_email_verified", 
        "is_staff", "is_active", "account_status", "last_login"
    ]
    list_filter = ["role", "is_email_verified", "is_staff", "is_active", "date_joined"]
    search_fields = ["email", "first_name", "last_name"]
    ordering = ["-date_joined"]
    readonly_fields = ["date_joined", "last_login", "last_login_ip"]
    
    fieldsets = UserAdmin.fieldsets + (
        ("Role & Verification", {
            "fields": ("role", "is_email_verified")
        }),
        ("Security", {
            "fields": ("failed_login_attempts", "account_locked_until", "last_login_ip")
        }),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Role", {
            "fields": ("role",)
        }),
    )
    
    actions = ['verify_email', 'unlock_accounts', 'lock_accounts']

    def full_name(self, obj):
        """Display full name"""
        return f"{obj.first_name} {obj.last_name}".strip() or "-"
    full_name.short_description = "Full Name"
    
    def account_status(self, obj):
        """Display account lock status with color"""
        if obj.is_account_locked():
            return format_html(
                '<span style="color: red;">🔒 Locked until {}</span>',
                obj.account_locked_until.strftime('%Y-%m-%d %H:%M')
            )
        return format_html('<span style="color: green;">✓ Active</span>')
    account_status.short_description = "Account Status"
    
    def verify_email(self, request, queryset):
        """Admin action to verify user emails"""
        updated = queryset.update(is_email_verified=True)
        self.message_user(request, f"{updated} user(s) email verified successfully.")
    verify_email.short_description = "Verify selected users' emails"
    
    def unlock_accounts(self, request, queryset):
        """Admin action to unlock accounts"""
        updated = queryset.update(
            failed_login_attempts=0,
            account_locked_until=None
        )
        self.message_user(request, f"{updated} account(s) unlocked successfully.")
    unlock_accounts.short_description = "Unlock selected accounts"
    
    def lock_accounts(self, request, queryset):
        """Admin action to lock accounts for 24 hours"""
        lock_until = timezone.now() + timezone.timedelta(hours=24)
        updated = queryset.update(account_locked_until=lock_until)
        self.message_user(request, f"{updated} account(s) locked for 24 hours.")
    lock_accounts.short_description = "Lock selected accounts (24h)"

@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = [
        "user_email", "purpose", "is_used", "is_valid_status",
        "created_at", "expires_at", "ip_address"
    ]
    list_filter = ["purpose", "is_used", "created_at", "expires_at"]
    search_fields = ["user__email"]
    readonly_fields = [
        "user", "otp_hash", "purpose", "created_at", 
        "expires_at", "is_used", "used_at", "ip_address"
    ]
    ordering = ["-created_at"]
    date_hierarchy = "created_at"
    
    def user_email(self, obj):
        """Display user email"""
        return obj.user.email
    user_email.short_description = "User Email"
    user_email.admin_order_field = "user__email"
    
    def is_valid_status(self, obj):
        """Display OTP validity status with color"""
        if obj.is_valid():
            return format_html('<span style="color: green;">✓ Valid</span>')
        elif obj.is_used:
            return format_html('<span style="color: gray;">Used</span>')
        else:
            return format_html('<span style="color: red;">✗ Expired</span>')
    is_valid_status.short_description = "Status"
    
    def has_add_permission(self, request):
        """Disable manual OTP creation through admin"""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Make OTP read-only in admin"""
        return False
    
    actions = ['delete_expired_otps']
    
    def delete_expired_otps(self, request, queryset):
        """Admin action to delete expired OTPs"""
        expired = queryset.filter(expires_at__lt=timezone.now())
        count = expired.count()
        expired.delete()
        self.message_user(request, f"{count} expired OTP(s) deleted.")
    delete_expired_otps.short_description = "Delete expired OTPs"
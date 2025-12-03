from rest_framework.throttling import AnonRateThrottle, UserRateThrottle

class OTPRequestThrottle(AnonRateThrottle):
    """Throttle for OTP request endpoints - 5 requests per hour"""
    rate = '5/hour'
    scope = 'otp_request'

class OTPVerifyThrottle(AnonRateThrottle):
    """Throttle for OTP verification endpoints - 10 requests per hour"""
    rate = '10/hour'
    scope = 'otp_verify'

class LoginThrottle(AnonRateThrottle):
    """Throttle for login attempts - 10 requests per hour"""
    rate = '10/hour'
    scope = 'login'

class RegistrationThrottle(AnonRateThrottle):
    """Throttle for registration - 5 requests per hour"""
    rate = '5/hour'
    scope = 'registration'

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

class DomainError(Exception):
    def __init__(self, message, code=status.HTTP_400_BAD_REQUEST):
        self.message = message
        self.code = code
        super().__init__(message)

class ValidationError(DomainError):
    pass

class AuthError(DomainError):
    def __init__(self, message):
        super().__init__(message, code=status.HTTP_401_UNAUTHORIZED)

class PermissionError(DomainError):
    def __init__(self, message):
        super().__init__(message, code=status.HTTP_403_FORBIDDEN)

class NotFoundError(DomainError):
    def __init__(self, message):
        super().__init__(message, code=status.HTTP_404_NOT_FOUND)


def custom_exception_handler(exc, context):
    if isinstance(exc, DomainError):
        return Response({
            'success': False,
            'error': {
                'message': exc.message,
                'code': exc.code
            }
        }, status=exc.code)
    response = exception_handler(exc, context)
    if response is not None:
        response.data = {
            'success': False,
            'error': {
                'message': response.data.get('detail', 'An error occurred'),
                'code': response.status_code
            }
        }
    return response

# To use: set in settings.py
# REST_FRAMEWORK = {
#     'EXCEPTION_HANDLER': 'core.error_handling.custom_exception_handler',
#     'DEFAULT_RENDERER_CLASSES': ['core.error_handling.StandardizedJSONRenderer']
# }

from rest_framework.renderers import JSONRenderer
class StandardizedJSONRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        if renderer_context and renderer_context.get('response'):
            status_code = renderer_context['response'].status_code
            if status_code < 400:
                data = {'success': True, 'data': data}
        return super().render(data, accepted_media_type, renderer_context)

from django.test import TestCase
from api.services import CodeGenerationService, CodeValidationService

class ServiceTestCase(TestCase):
    def test_code_generation_cache(self):
        result = CodeGenerationService.generate('Test prompt')
        self.assertIn('code', result)
        self.assertIn('source', result)

    def test_code_validation(self):
        result = CodeValidationService.validate('IF TankLevel < 20.0 THEN\n    Pump := TRUE;\nEND_IF;')
        self.assertIn('valid', result)

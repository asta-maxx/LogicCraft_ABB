from django.test import TestCase, Client
from django.urls import reverse

class APITestCase(TestCase):
    def setUp(self):
        self.client = Client()

    def test_generate_missing_input(self):
        response = self.client.post(reverse('generate-code'), data={})
        self.assertEqual(response.status_code, 400)

    def test_validate_missing_code(self):
        response = self.client.post(reverse('validate-code'), data={})
        self.assertEqual(response.status_code, 400)

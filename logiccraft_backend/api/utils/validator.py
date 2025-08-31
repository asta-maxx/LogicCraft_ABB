import tempfile
import subprocess
import os

class Validator:
    def validate(self, code):
        with tempfile.NamedTemporaryFile(delete=False, suffix='.st') as tmp:
            tmp.write(code.encode())
            tmp_path = tmp.name
        try:
            result = subprocess.run([
                'openplc_validator', '--check', tmp_path
            ], capture_output=True, text=True, timeout=10)
            valid = result.returncode == 0
            errors = result.stderr if not valid else None
            warnings = result.stdout if valid else None
            return {
                'valid': valid,
                'errors': errors,
                'warnings': warnings or 'No warnings.'
            }
        except Exception as e:
            return {
                'valid': False,
                'errors': str(e),
                'warnings': None
            }
        finally:
            os.remove(tmp_path)


import tempfile
import subprocess
import os
import shutil

class Validator:
    _last_tmpdir = None

    def validate(self, code):
        # Clean up previous temp dir if it exists
        if Validator._last_tmpdir and os.path.exists(Validator._last_tmpdir):
            try:
                shutil.rmtree(Validator._last_tmpdir)
            except Exception:
                pass

        tmpdir = tempfile.mkdtemp(prefix="iec2c_session_")
        Validator._last_tmpdir = tmpdir
        tmp_path = os.path.join(tmpdir, "input.st")
        with open(tmp_path, "w") as tmp:
            tmp.write(code)
        try:
            # Use matiec (iec2c) compiler for validation, prefer local ./iec2c
            project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
            iec2c_path = os.path.join(project_root, 'iec2c')
            if not os.path.isfile(iec2c_path):
                iec2c_path = '../../iec2c'  # fallback to PATH if not found locally
                cwd = tmpdir
            else:
                cwd = tmpdir
            lib_dir = os.path.abspath(os.path.join(project_root, 'lib'))
            result = subprocess.run([
                iec2c_path, '-I', lib_dir, tmp_path
            ], capture_output=True, text=True, timeout=10, cwd=cwd)
            valid = result.returncode == 0
            errors = result.stderr if not valid else None
            output = result.stdout if valid else None
            return {
                'valid': valid,
                'errors': errors,
                'output': output or 'No output.',
                'tmpdir': tmpdir  # Optionally return the temp dir for simulation use
            }
        except Exception as e:
            return {
                'valid': False,
                'errors': str(e),
                'warnings': None
            }

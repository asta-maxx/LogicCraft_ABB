import subprocess
import os

OPENPLC_CLI_PATH = "/path/to/openplc_cli"  # Set your OpenPLC CLI path

def validate_code(code: str) -> dict:
    """Validate IEC 61131-3 Structured Text code using OpenPLC CLI."""
    temp_file = "temp.st"
    with open(temp_file, "w") as f:
        f.write(code)

    try:
        result = subprocess.run(
            [OPENPLC_CLI_PATH, "validate", temp_file],
            capture_output=True, text=True, timeout=10
        )
        return {
            "valid": result.returncode == 0,
            "stdout": result.stdout.strip(),
            "stderr": result.stderr.strip()
        }
    except subprocess.TimeoutExpired:
        return {"valid": False, "stdout": "", "stderr": "Validation timed out."}
    except Exception as e:
        return {"valid": False, "stdout": "", "stderr": str(e)}
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)

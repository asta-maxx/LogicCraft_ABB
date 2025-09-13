#!/bin/bash
# setup_matiec.sh: Clone, build, and set up matiec (iec2c) for your project
# Usage: bash setup_matiec.sh

set -e

REPO_URL="https://github.com/nucleron/matiec.git"
MATIEC_DIR="matiec_src"


# Detect OS
OS="$(uname -s)"

# Handle Windows
if [[ "$OS" == MINGW* || "$OS" == CYGWIN* || "$OS" == MSYS* || "$OS" == "Windows_NT" ]]; then
    echo "Detected Windows OS. Attempting to find iec2c.exe from OpenPLC..."
    # Common OpenPLC install paths
    WIN_PATHS=(
        "/c/OpenPLC/matiec/iec2c.exe"
        "/c/Program Files/OpenPLC/matiec/iec2c.exe"
        "/c/Program Files (x86)/OpenPLC/matiec/iec2c.exe"
        "$USERPROFILE/OpenPLC/matiec/iec2c.exe"
    )
    FOUND=""
    for p in "${WIN_PATHS[@]}"; do
        if [ -f "$p" ]; then
            FOUND="$p"
            break
        fi
    done
    if [ -n "$FOUND" ]; then
        echo "Found iec2c.exe at $FOUND. Copying to project root..."
        cp "$FOUND" ./iec2c.exe
        echo "iec2c.exe is now available at $(pwd)/iec2c.exe"
        echo "Windows setup complete!"
        exit 0
    else
        echo "iec2c.exe not found in common locations."
        echo "Please install OpenPLC from https://www.openplcproject.com/download/ and rerun this script."
        exit 1
    fi
fi


# Check for required tools
command -v git >/dev/null 2>&1 || { echo >&2 "git is required but not installed. Aborting."; exit 1; }
command -v make >/dev/null 2>&1 || { echo >&2 "make is required but not installed. Aborting."; exit 1; }
command -v gcc >/dev/null 2>&1 || { echo >&2 "gcc is required but not installed. Aborting."; exit 1; }
command -v bison >/dev/null 2>&1 || { echo >&2 "bison is required but not installed. Aborting."; exit 1; }

# Check bison version >= 2.4
BISON_VERSION=$(bison --version | head -n1 | awk '{print $4}')
BISON_MAJOR=$(echo $BISON_VERSION | cut -d. -f1)
BISON_MINOR=$(echo $BISON_VERSION | cut -d. -f2)
if [ "$BISON_MAJOR" -lt 2 ] || { [ "$BISON_MAJOR" -eq 2 ] && [ "$BISON_MINOR" -lt 4 ]; }; then
    echo "Wrong bison version: $BISON_VERSION < 2.4"
    echo "Please upgrade bison to version 2.4 or higher."
    echo "- On macOS: brew install bison"
    echo "- On Ubuntu/Debian: sudo apt-get install bison"
    echo "If you installed a newer bison with Homebrew, add it to your PATH:"
    echo "  export PATH=\"/usr/local/opt/bison/bin:$PATH\"  # or /opt/homebrew/opt/bison/bin for Apple Silicon"
    exit 1
fi

# Clone matiec if not already present
if [ ! -d "$MATIEC_DIR" ]; then
    echo "Cloning matiec from $REPO_URL ..."
    git clone "$REPO_URL" "$MATIEC_DIR"
else
    echo "matiec source already exists. Pulling latest changes..."
    cd "$MATIEC_DIR"
    git pull
    cd ..
fi

echo "matiec setup complete!"
# Build matiec

cd "$MATIEC_DIR"
echo "Patching debug_ast.cc for C++11 format macro compatibility ..."

# Patch format macro usage for C++11 (add space between string and macro)
DEBUG_AST="absyntax_utils/debug_ast.cc"
if [ -f "$DEBUG_AST" ]; then
    sed -i.bak 's/"%"PRId64""/"%" PRId64 ""/g' "$DEBUG_AST"
    sed -i.bak 's/"%"PRIu64""/"%" PRIu64 ""/g' "$DEBUG_AST"
    rm -f "$DEBUG_AST.bak"
fi

# Patch array_range_check.cc for C++11 format macro compatibility (all cases)
ARRAY_RANGE_CHECK="stage3/array_range_check.cc"
if [ -f "$ARRAY_RANGE_CHECK" ]; then
    # Fix all %PRId64 and %PRIu64 macro usages, even with punctuation or parentheses
    sed -i.bak -E 's/%"PRId64([^"]*)"/%" PRId64\1"/g' "$ARRAY_RANGE_CHECK"
    sed -i.bak -E 's/%"PRIu64([^"]*)"/%" PRIu64\1"/g' "$ARRAY_RANGE_CHECK"
    sed -i.bak -E 's/%"PRIu64([^"]*)\)/%" PRIu64\1\)/g' "$ARRAY_RANGE_CHECK"
    sed -i.bak -E 's/%"PRId64([^"]*)\)/%" PRId64\1\)/g' "$ARRAY_RANGE_CHECK"
    rm -f "$ARRAY_RANGE_CHECK.bak"
fi

echo "Building matiec (iec2c) ..."

# If configure script is missing, try to generate it with autoreconf -i
if [ ! -f ./configure ]; then
    echo "'configure' script not found. Attempting to generate it with autoreconf -i ..."
    command -v autoreconf >/dev/null 2>&1 || { echo >&2 "autoreconf is required but not installed. Aborting."; exit 1; }
    autoreconf -i
fi

# Run ./configure if present
if [ -f ./configure ]; then
    echo "Running ./configure ..."
    ./configure
else
    echo "'configure' script still not found after autoreconf. Please check the repository and dependencies."
    exit 1
fi

# Try to run 'make clean' if available, otherwise just run 'make'
if grep -q '^clean:' Makefile 2>/dev/null; then
    make clean
fi

if make; then
    cd ..
    # Copy the binary to project root (optional)
    if [ -f "$MATIEC_DIR/iec2c" ]; then
        cp "$MATIEC_DIR/iec2c" ./iec2c
        echo "iec2c binary is now available at $(pwd)/iec2c"
        # Copy the lib directory to project root for iec2c runtime
        if [ -d "$MATIEC_DIR/lib" ]; then
            cp -r "$MATIEC_DIR/lib" ./lib
            echo "lib directory is now available at $(pwd)/lib"
        else
            echo "Warning: lib directory not found in $MATIEC_DIR. iec2c may not work correctly."
        fi
        echo "matiec setup complete!"
    else
        echo "Build finished, but iec2c binary not found. Please check the build output for errors."
        exit 1
    fi
else
    echo "Build failed: 'make' did not complete successfully. Please check the output above for errors."
    exit 1
fi

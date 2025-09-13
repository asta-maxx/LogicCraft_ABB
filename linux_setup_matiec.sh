#!/usr/bin/env bash
set -e

# === CONFIG ===
# Where to place the build/install
INSTALL_DIR="$(pwd)/matiec_local"

# === INSTALL DEPENDENCIES (Arch Linux) ===
# echo "[*] Installing build dependencies..."
# sudo pacman -S --needed --noconfirm base-devel git flex bison automake autoconf libtool

# === CLONE REPO ===
if [ ! -d "matiec" ]; then
    echo "[*] Cloning matiec..."
    git clone https://github.com/thiagoralves/matiec.git
else
    echo "[*] matiec already exists, pulling latest..."
    cd matiec
    git pull
    cd ..
fi

# === BUILD ===
cd matiec
echo "[*] Running autoreconf..."
autoreconf -i

echo "[*] Configuring with prefix: $INSTALL_DIR"
./configure --prefix="$INSTALL_DIR"

echo "[*] Building..."
make -j$(nproc)

echo "[*] Installing locally..."
make install

cd ..

# === DONE ===
echo "[*] Build complete!"
echo "iec2c binary is at: $INSTALL_DIR/bin/iec2c"
echo "Add it to PATH with:"
echo "  export PATH=\$PATH:$INSTALL_DIR/bin"

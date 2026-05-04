#!/bin/bash

# Configuration: Source and target directories
SOURCE_DIR="agents/"
TARGET_DIRS=(".cursor/" ".claude/" ".antigravity/")

# Get the script's directory (already in project root)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Synchronizing frontend skills from $SOURCE_DIR..."

# Check if source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Error: Source directory $SOURCE_DIR does not exist."
    exit 1
fi

# Iterate over target directories
for TARGET_DIR in "${TARGET_DIRS[@]}"; do
    echo "📁 Syncing to $TARGET_DIR..."
    
    # Create target directory if it doesn't exist
    mkdir -p "$TARGET_DIR"
    
    # Sync folders using rsync
    rsync -av --delete "$SOURCE_DIR/" "$TARGET_DIR/"
done

echo "✅ Frontend sync complete!"

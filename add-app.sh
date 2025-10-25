#!/bin/bash

# Script to add a new app to apps.json
# Usage: ./add-app.sh

# Colors for better UX
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}    Add New App to Serieworks Website${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Prompt for app information
echo -e "${GREEN}App Title:${NC}"
read -p "> " title

echo -e "\n${GREEN}Category:${NC}"
echo "  Options: educational, game, productivity, social, health, finance, entertainment, utilities, lifestyle, news, travel"
read -p "> " category

echo -e "\n${GREEN}Description:${NC}"
read -p "> " description

echo -e "\n${GREEN}App Store URL (or # if not available):${NC}"
read -p "> " appStore
# Default to # if empty
appStore=${appStore:-#}

echo -e "\n${GREEN}Play Store URL (or # if not available):${NC}"
read -p "> " playStore
# Default to # if empty
playStore=${playStore:-#}

echo -e "\n${GREEN}Image filename (will be saved in assets/app_img/):${NC}"
echo "  Example: my_app.png"
read -p "> " imageFile

# Default to snake_case version of title if empty
if [ -z "$imageFile" ]; then
    imageFile=$(echo "$title" | tr '[:upper:]' '[:lower:]' | tr ' ' '_' | sed 's/[^a-z0-9_]//g')
    imageFile="${imageFile}.png"
    echo -e "${YELLOW}  Using default: $imageFile${NC}"
fi

imagePath="assets/app_img/$imageFile"

echo -e "\n${GREEN}Status:${NC}"
echo "  Options: production, in-progress"
read -p "> " status
# Default to in-progress if empty
status=${status:-in-progress}

# Show summary
echo -e "\n${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}         App Information Summary${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "Title:        ${YELLOW}$title${NC}"
echo -e "Category:     ${YELLOW}$category${NC}"
echo -e "Description:  ${YELLOW}$description${NC}"
echo -e "App Store:    ${YELLOW}$appStore${NC}"
echo -e "Play Store:   ${YELLOW}$playStore${NC}"
echo -e "Image:        ${YELLOW}$imagePath${NC}"
echo -e "Status:       ${YELLOW}$status${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Confirm
read -p "Add this app to apps.json? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo -e "${RED}Cancelled.${NC}"
    exit 0
fi

# Create temporary file with new app entry
newApp=$(cat <<EOF
  {
    "title": "$title",
    "category": "$category",
    "description": "$description",
    "appStore": "$appStore",
    "playStore": "$playStore",
    "image": "$imagePath",
    "status": "$status"
  }
EOF
)

# Backup original file
cp apps.json apps.json.backup

# Use Python to properly add the new app to the JSON array
python3 - <<PYTHON_SCRIPT
import json
import sys

try:
    # Read existing apps
    with open('apps.json', 'r') as f:
        apps = json.load(f)
    
    # Create new app object
    new_app = {
        "title": "$title",
        "category": "$category",
        "description": "$description",
        "appStore": "$appStore",
        "playStore": "$playStore",
        "image": "$imagePath",
        "status": "$status"
    }
    
    # Add new app
    apps.append(new_app)
    
    # Write back with proper formatting
    with open('apps.json', 'w') as f:
        json.dump(apps, f, indent=2)
    
    print("Success")
    sys.exit(0)
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
PYTHON_SCRIPT

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✓ App added successfully!${NC}"
    echo -e "${YELLOW}⚠ Don't forget to:${NC}"
    echo -e "  1. Add the app image to ${BLUE}assets/app_img/$imageFile${NC}"
    echo -e "  2. Commit your changes: ${BLUE}git add . && git commit -m 'Add $title app'${NC}"
    echo -e "  3. Push to GitHub: ${BLUE}git push${NC}\n"
else
    echo -e "\n${RED}✗ Failed to add app. Restoring backup...${NC}"
    mv apps.json.backup apps.json
    exit 1
fi

# Clean up backup
rm apps.json.backup

echo -e "${GREEN}Done!${NC}\n"

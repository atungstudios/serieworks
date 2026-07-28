#!/bin/bash

# Script to add a new record to apps.json
# Usage: ./add-app.sh

# Colors for better UX
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}    Add New Record to Serieworks Website${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Prompt for record type
echo -e "${GREEN}Record Type:${NC}"
echo "  Options: app, website"
read -p "> " type
type=${type:-app}

if [[ "$type" != "app" && "$type" != "website" ]]; then
    echo -e "${RED}Invalid type. Please use 'app' or 'website'.${NC}"
    exit 1
fi

# Prompt for common record information
echo -e "\n${GREEN}Title:${NC}"
read -p "> " title

echo -e "\n${GREEN}Category:${NC}"
echo "  Options: educational, game, productivity, social, health, finance, entertainment, utilities, lifestyle, news, travel"
read -p "> " category

echo -e "\n${GREEN}Description:${NC}"
read -p "> " description

if [ "$type" = "app" ]; then
    echo -e "\n${GREEN}App Store URL (or # if not available):${NC}"
    read -p "> " appStore
    appStore=${appStore:-#}

    echo -e "\n${GREEN}Play Store URL (or # if not available):${NC}"
    read -p "> " playStore
    playStore=${playStore:-#}
else
    echo -e "\n${GREEN}Website URL (or # if not available):${NC}"
    read -p "> " websiteUrl
    websiteUrl=${websiteUrl:-#}

    echo -e "\n${GREEN}Website Button Label:${NC}"
    echo "  Example: Visit Website"
    read -p "> " websiteLabel
    websiteLabel=${websiteLabel:-Visit Website}
fi

echo -e "\n${GREEN}Image filename (will be saved in assets/app_img/):${NC}"
echo "  Example: my_app.png"
if [ "$type" = "website" ]; then
    echo "  Leave blank to auto-use website favicon"
fi
read -p "> " imageFile

# Default image behavior by record type
if [ -z "$imageFile" ]; then
    if [ "$type" = "website" ]; then
        imagePath=""
        echo -e "${YELLOW}  Using default: website favicon${NC}"
    else
        imageFile=$(echo "$title" | tr '[:upper:]' '[:lower:]' | tr ' ' '_' | sed 's/[^a-z0-9_]//g')
        imageFile="${imageFile}.png"
        echo -e "${YELLOW}  Using default: $imageFile${NC}"
        imagePath="assets/app_img/$imageFile"
    fi
else
    imagePath="assets/app_img/$imageFile"
fi

echo -e "\n${GREEN}Status:${NC}"
echo "  Options: production, in-progress"
read -p "> " status
# Default to in-progress if empty
status=${status:-in-progress}

# Show summary
echo -e "\n${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}       Record Information Summary${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "Type:         ${YELLOW}$type${NC}"
echo -e "Title:        ${YELLOW}$title${NC}"
echo -e "Category:     ${YELLOW}$category${NC}"
echo -e "Description:  ${YELLOW}$description${NC}"
if [ "$type" = "app" ]; then
    echo -e "App Store:    ${YELLOW}$appStore${NC}"
    echo -e "Play Store:   ${YELLOW}$playStore${NC}"
else
    echo -e "Website URL:  ${YELLOW}$websiteUrl${NC}"
    echo -e "Button Label: ${YELLOW}$websiteLabel${NC}"
fi
echo -e "Image:        ${YELLOW}$imagePath${NC}"
echo -e "Status:       ${YELLOW}$status${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Confirm
read -p "Add this record to apps.json? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo -e "${RED}Cancelled.${NC}"
    exit 0
fi

# Backup original file
cp apps.json apps.json.backup

# Use Python to properly add the new record to the JSON array
TYPE="$type" TITLE="$title" CATEGORY="$category" DESCRIPTION="$description" APP_STORE="$appStore" PLAY_STORE="$playStore" WEBSITE_URL="$websiteUrl" WEBSITE_LABEL="$websiteLabel" IMAGE_PATH="$imagePath" STATUS="$status" python3 - <<'PYTHON_SCRIPT'
import json
import os
import sys

try:
    # Read existing apps
    with open('apps.json', 'r') as f:
        apps = json.load(f)
    
    # Create new record object
    record_type = os.environ.get("TYPE", "app")
    new_record = {
        "type": record_type,
        "title": os.environ.get("TITLE", ""),
        "category": os.environ.get("CATEGORY", ""),
        "description": os.environ.get("DESCRIPTION", ""),
        "image": os.environ.get("IMAGE_PATH", ""),
        "status": os.environ.get("STATUS", "in-progress")
    }

    if record_type == "website":
        new_record["websiteUrl"] = os.environ.get("WEBSITE_URL", "#")
        new_record["websiteLabel"] = os.environ.get("WEBSITE_LABEL", "Visit Website")
    else:
        new_record["appStore"] = os.environ.get("APP_STORE", "#")
        new_record["playStore"] = os.environ.get("PLAY_STORE", "#")
    
    # Add new record
    apps.append(new_record)
    
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
    echo -e "\n${GREEN}✓ Record added successfully!${NC}"
    echo -e "${YELLOW}⚠ Don't forget to:${NC}"
    echo -e "  1. Add the image to ${BLUE}assets/app_img/$imageFile${NC}"
    echo -e "  2. Commit your changes: ${BLUE}git add . && git commit -m 'Add $title record'${NC}"
    echo -e "  3. Push to GitHub: ${BLUE}git push${NC}\n"
else
    echo -e "\n${RED}✗ Failed to add record. Restoring backup...${NC}"
    mv apps.json.backup apps.json
    exit 1
fi

# Clean up backup
rm apps.json.backup

echo -e "${GREEN}Done!${NC}\n"

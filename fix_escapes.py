import re

# Read the file
with open(r'd:\SocialAsset\TrendStable\TrendStable\src\app\features\user-dashboard\services\services.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Fix lines 37122-37128 (0-indexed: 37121-37127)
# Replace the entire problematic section
if len(lines) > 37128:
    # Replace lines 37122-37128 with the correct content
    lines[37121] = '                                    <p class="font-medium text-sm leading-tight">Telegram Channel/Group Members {{ \'{\'  }}Start : Instant{{ \'}\' }} | 🔥 {{ \'{\'  }} speed : 100K/D{{ \'}\' }} | NO refill</p>\r\n'
    # Delete lines 37123-37128 (indices 37122-37127)
    for i in range(6):
        if len(lines) > 37122:
            del lines[37122]

# Write back
with open(r'd:\SocialAsset\TrendStable\TrendStable\src\app\features\user-dashboard\services\services.html', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Fixed the Telegram service line")

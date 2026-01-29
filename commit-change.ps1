
# Green IQ Commit and Cleanup Script

echo "Starting cleanup and commit process..."

# 1. Add all changes
echo "Adding changes to git..."
git add .

# 2. Commit with message
echo "Committing changes..."
git commit -m "Update: Integrated Backend-Driven Barcode Analysis, Maps Service, and Cleanup"

echo "Done! Changes committed locally."

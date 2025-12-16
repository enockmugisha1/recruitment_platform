#!/bin/bash

echo "🐘 Supabase Database Setup"
echo "=========================="
echo ""
echo "Your Supabase connection string needs your password."
echo ""
echo "Current DATABASE_URL in .env:"
grep "DATABASE_URL" .env
echo ""
echo "⚠️  Notice: [YOUR-PASSWORD] needs to be replaced with your actual password"
echo ""
read -p "Enter your Supabase password: " -s PASSWORD
echo ""
echo ""
echo "Updating .env file..."
sed -i "s/\[YOUR-PASSWORD\]/$PASSWORD/g" .env
echo "✅ Password updated!"
echo ""
echo "Testing connection..."
source env/bin/activate
python manage.py check --database default
if [ $? -eq 0 ]; then
    echo "✅ Connection successful!"
    echo ""
    echo "Would you like to run migrations now? (y/n)"
    read -p "" MIGRATE
    if [ "$MIGRATE" = "y" ]; then
        python manage.py migrate
        echo "✅ Migrations complete!"
    fi
else
    echo "❌ Connection failed. Please check your password."
fi

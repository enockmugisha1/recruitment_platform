#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  PostgreSQL Database Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Database configuration
DB_NAME="recruitment_db"
DB_USER="recruitment_user"
DB_PASSWORD="kingofkings"

echo -e "${YELLOW}This script will set up your PostgreSQL database.${NC}"
echo -e "${YELLOW}You may be prompted for your sudo password.${NC}"
echo ""

# Create SQL commands file
cat > /tmp/setup_db.sql << EOF
-- Drop existing database and user if they exist
DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $DB_USER;

-- Create new user
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';

-- Create database
CREATE DATABASE $DB_NAME OWNER $DB_USER;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF

echo -e "${BLUE}Creating database and user...${NC}"

# Run SQL commands as postgres user
sudo -u postgres psql -f /tmp/setup_db.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database and user created successfully${NC}"
    
    # Grant schema privileges
    sudo -u postgres psql -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;"
    sudo -u postgres psql -d $DB_NAME -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;"
    sudo -u postgres psql -d $DB_NAME -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;"
    
    echo -e "${GREEN}✓ Privileges granted${NC}"
else
    echo -e "${RED}✗ Failed to create database${NC}"
    rm /tmp/setup_db.sql
    exit 1
fi

# Clean up
rm /tmp/setup_db.sql

echo ""
echo -e "${BLUE}Testing database connection...${NC}"
PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -c "SELECT version();" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
else
    echo -e "${RED}✗ Database connection failed${NC}"
    exit 1
fi
echo ""

# Run Django migrations
echo -e "${BLUE}Running Django migrations...${NC}"

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d "env" ]; then
    source env/bin/activate
fi

python manage.py makemigrations
python manage.py migrate

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Migrations completed successfully${NC}"
else
    echo -e "${YELLOW}⚠ Please run migrations manually: python manage.py migrate${NC}"
fi
echo ""

# Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Database Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Database Details:"
echo -e "  Name:     ${BLUE}$DB_NAME${NC}"
echo -e "  User:     ${BLUE}$DB_USER${NC}"
echo -e "  Password: ${BLUE}$DB_PASSWORD${NC}"
echo -e "  Host:     ${BLUE}localhost${NC}"
echo -e "  Port:     ${BLUE}5432${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Create a superuser: ${BLUE}python manage.py createsuperuser${NC}"
echo -e "  2. Start the server:   ${BLUE}./start_dev.sh${NC}"
echo -e "  3. Or start manually:  ${BLUE}python manage.py runserver${NC}"
echo ""

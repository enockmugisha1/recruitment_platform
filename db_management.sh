#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Database configuration
DB_NAME="recruitment_db"
DB_USER="recruitment_user"
BACKUP_DIR="$HOME/recruitment_backups"

# Print usage
usage() {
    echo -e "${BLUE}Database Management Tool${NC}"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  backup           Create a database backup"
    echo "  restore [file]   Restore database from backup file"
    echo "  reset            Reset database (drop and recreate)"
    echo "  status           Check database status"
    echo "  migrate          Run Django migrations"
    echo "  shell            Open PostgreSQL shell"
    echo "  help             Show this help message"
    echo ""
}

# Check database status
check_status() {
    echo -e "${BLUE}Checking database status...${NC}"
    
    # Check if PostgreSQL is running
    if sudo systemctl is-active --quiet postgresql; then
        echo -e "${GREEN}✓ PostgreSQL service is running${NC}"
    else
        echo -e "${RED}✗ PostgreSQL service is not running${NC}"
        return 1
    fi
    
    # Check if database exists
    if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
        echo -e "${GREEN}✓ Database '$DB_NAME' exists${NC}"
    else
        echo -e "${RED}✗ Database '$DB_NAME' does not exist${NC}"
        return 1
    fi
    
    # Check connection
    PGPASSWORD=kingofkings psql -h localhost -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Database connection successful${NC}"
    else
        echo -e "${RED}✗ Database connection failed${NC}"
        return 1
    fi
    
    # Show database info
    echo ""
    echo -e "${BLUE}Database Information:${NC}"
    PGPASSWORD=kingofkings psql -h localhost -U $DB_USER -d $DB_NAME -c "
        SELECT 
            pg_size_pretty(pg_database_size('$DB_NAME')) as size,
            (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public') as tables;
    "
}

# Backup database
backup_db() {
    echo -e "${BLUE}Creating database backup...${NC}"
    
    # Create backup directory if it doesn't exist
    mkdir -p "$BACKUP_DIR"
    
    # Generate backup filename with timestamp
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_backup_${TIMESTAMP}.sql"
    
    # Create backup
    PGPASSWORD=kingofkings pg_dump -h localhost -U $DB_USER -d $DB_NAME -F p -f "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Backup created successfully${NC}"
        echo -e "  Location: ${BLUE}$BACKUP_FILE${NC}"
        
        # Compress backup
        gzip "$BACKUP_FILE"
        echo -e "${GREEN}✓ Backup compressed${NC}"
        echo -e "  Final file: ${BLUE}${BACKUP_FILE}.gz${NC}"
    else
        echo -e "${RED}✗ Backup failed${NC}"
        return 1
    fi
}

# Restore database
restore_db() {
    if [ -z "$1" ]; then
        echo -e "${RED}Error: Please specify backup file to restore${NC}"
        echo "Usage: $0 restore /path/to/backup.sql[.gz]"
        return 1
    fi
    
    BACKUP_FILE="$1"
    
    if [ ! -f "$BACKUP_FILE" ]; then
        echo -e "${RED}Error: Backup file not found: $BACKUP_FILE${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}⚠ Warning: This will replace all current data${NC}"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        echo -e "${YELLOW}Restore cancelled${NC}"
        return 0
    fi
    
    echo -e "${BLUE}Restoring database...${NC}"
    
    # Check if file is compressed
    if [[ "$BACKUP_FILE" == *.gz ]]; then
        gunzip -c "$BACKUP_FILE" | PGPASSWORD=kingofkings psql -h localhost -U $DB_USER -d $DB_NAME
    else
        PGPASSWORD=kingofkings psql -h localhost -U $DB_USER -d $DB_NAME < "$BACKUP_FILE"
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Database restored successfully${NC}"
    else
        echo -e "${RED}✗ Restore failed${NC}"
        return 1
    fi
}

# Reset database
reset_db() {
    echo -e "${YELLOW}⚠ Warning: This will delete all data and recreate the database${NC}"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        echo -e "${YELLOW}Reset cancelled${NC}"
        return 0
    fi
    
    echo -e "${BLUE}Resetting database...${NC}"
    
    # Run the setup script
    bash setup_local_db.sh
}

# Run migrations
run_migrations() {
    echo -e "${BLUE}Running Django migrations...${NC}"
    
    # Activate virtual environment
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
        echo -e "${RED}✗ Migrations failed${NC}"
        return 1
    fi
}

# Open database shell
open_shell() {
    echo -e "${BLUE}Opening PostgreSQL shell...${NC}"
    echo -e "${YELLOW}Type '\q' to exit${NC}"
    PGPASSWORD=kingofkings psql -h localhost -U $DB_USER -d $DB_NAME
}

# Main script
case "$1" in
    status)
        check_status
        ;;
    backup)
        backup_db
        ;;
    restore)
        restore_db "$2"
        ;;
    reset)
        reset_db
        ;;
    migrate)
        run_migrations
        ;;
    shell)
        open_shell
        ;;
    help|"")
        usage
        ;;
    *)
        echo -e "${RED}Error: Unknown command '$1'${NC}"
        echo ""
        usage
        exit 1
        ;;
esac

#!/bin/bash
# Script de backup do PostgreSQL
# Agende no cron da VPS: 0 2 * * * /opt/sge/scripts/backup.sh

BACKUP_DIR="/data/backups"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER="sge_db"
DB_USER="sge_user"
DB_NAME="sge"

mkdir -p "$BACKUP_DIR"

# Gera o backup
docker exec "$CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_DIR/sge_$DATE.sql.gz"

echo "Backup criado: sge_$DATE.sql.gz"

# Remove backups com mais de 30 dias
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete

echo "Backups antigos removidos."

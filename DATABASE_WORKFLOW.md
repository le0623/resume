# Database Workflow Guide

## 🎯 Quick Reference

### First Time Setup
```bash
make first-time    # Start services + setup database
# OR
make quick-start   # Complete setup with environment file
```

### Regular Development
```bash
make dev          # Start development (data preserved)
make up           # Start production (data preserved)
```

### Database Management
```bash
make db-check     # Check if database needs setup
make db-migrate   # Run migrations (safe, preserves data)
make db-seed      # Add sample data only
```

### Reset Database (⚠️ DELETES DATA)
```bash
make db-setup     # Reset and setup database
make db-reset     # Complete database reset
```

## 🔄 Workflow Examples

### Scenario 1: First Time User
```bash
# 1. Clone and setup environment
git clone <repo>
cd resume-gen
cp .env.example .env  # Edit with your API keys

# 2. One-time setup
make first-time

# 3. Start developing
make dev
```

### Scenario 2: Daily Development
```bash
# Start development (data preserved from yesterday)
make dev

# Your profiles, templates, and resumes are still there!
```

### Scenario 3: Need to Reset Database
```bash
# ⚠️ This will delete all your data!
make db-setup

# Or complete reset
make db-reset
```

### Scenario 4: Schema Changes
```bash
# After modifying prisma/schema.prisma
make db-migrate   # Apply schema changes (preserves data)
```

## 🛡️ Data Persistence

- **Docker Volume**: PostgreSQL data is stored in `postgres_data` volume
- **Survives Restarts**: Data persists when you stop/start containers
- **Survives Rebuilds**: Data persists when you rebuild Docker images
- **Manual Reset Only**: Data is only lost when you explicitly run `db-setup` or `db-reset`

## 🚨 Important Notes

1. **Never run `make db-setup` unless you want to reset data**
2. **Use `make db-migrate` for schema changes**
3. **Use `make db-check` to verify database status**
4. **Backup before major changes**: `make db-backup`

## 🔧 Troubleshooting

### Database Not Working?
```bash
make db-check     # Check status
make db-migrate   # Try migrations
make db-setup     # Reset if needed (⚠️ deletes data)
```

### Services Won't Start?
```bash
make down         # Stop everything
make clean        # Clean up
make up           # Start fresh
```

### Need to Backup?
```bash
make db-backup    # Creates timestamped backup in ./backups/
```

### Restore from Backup?
```bash
make db-restore BACKUP_FILE=backup_20241201_143022.sql
```

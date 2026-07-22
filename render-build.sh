#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "Running migrations..."
php artisan migrate --force

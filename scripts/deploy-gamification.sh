#!/bin/bash
# Script to deploy gamification schema to Supabase

echo "🚀 Deploying Gamification Schema to Supabase..."

# Check if SUPABASE_URL and SUPABASE_SERVICE_KEY are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo "❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set"
    echo "Please set them in your .env.local file or environment"
    exit 1
fi

# Run the migration
echo "📝 Executing gamification_schema.sql..."
psql "$SUPABASE_URL" < gamification_schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Gamification schema deployed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Verify tables were created: ranks, badges, gamification_stats, xp_logs, user_badges"
    echo "2. Test the add_user_xp function"
    echo "3. Check RLS policies are active"
else
    echo "❌ Error deploying schema"
    exit 1
fi

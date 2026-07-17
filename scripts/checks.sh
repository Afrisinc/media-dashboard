#!/bin/bash

set -e

echo "🔍 Running all code quality checks...\n"

echo "📝 Formatting code..."
npm run format
echo "✓ Formatting complete\n"

echo "🔗 Fixing lint issues..."
npm run lint:fix
echo "✓ Linting fixed\n"

echo "📋 Type checking..."
npm run type-check
echo "✓ Type check passed\n"

echo "🏗️  Building project..."
npm run build
echo "✓ Build successful\n"

echo "🖥️  Building SSR server..."
npm run build:server
echo "✓ SSR build successful\n"

echo "✅ All checks passed! Code is production-ready."

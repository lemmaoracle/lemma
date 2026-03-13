#!/bin/bash
# Publish Lemma packages to npm
# Usage: ./scripts/publish-npm.sh [version]

set -e

VERSION=${1:-"patch"}

echo "🚀 Publishing Lemma packages to npm"
echo "Version bump: $VERSION"

# Check if user is logged into npm
if ! npm whoami &> /dev/null; then
    echo "❌ Not logged into npm. Please run 'npm login' first."
    exit 1
fi

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run from repository root"
    exit 1
fi

echo "📦 Building packages..."
pnpm build

echo "🔄 Bumping versions..."
cd packages/spec
npm version $VERSION --no-git-tag-version
SPEC_VERSION=$(node -p "require('./package.json').version")
cd ..

cd sdk
npm version $VERSION --no-git-tag-version
# Backup original package.json
cp package.json package.json.backup
# Update SDK's dependency on spec to match new version
node -e "
const pkg = require('./package.json');
pkg.dependencies['@lemmaoracle/spec'] = '^${SPEC_VERSION}';
require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
"
cd ../..

echo "📝 Updated spec version: $SPEC_VERSION"
echo "📝 Updated SDK dependency to: ^$SPEC_VERSION"

echo "🔄 Updating lockfile..."
pnpm install --no-frozen-lockfile

echo "🚀 Publishing @lemmaoracle/spec..."
cd packages/spec
npm publish --access public
cd ..

echo "🚀 Publishing @lemmaoracle/sdk..."
cd sdk
npm publish --access public
cd ../..

echo "✅ Published successfully!"

echo "🔄 Restoring SDK package.json for development..."
cd packages/sdk
mv package.json.backup package.json
cd ../..

echo ""
echo "📋 Summary:"
echo "  - @lemmaoracle/spec@$SPEC_VERSION"
echo "  - @lemmaoracle/sdk@$(node -p "require('./packages/sdk/package.json.backup').version")"
echo ""
echo "⚠️  Don't forget to:"
echo "  1. Commit the version changes in packages/spec/package.json"
echo "  2. Update the SDK dependency manually or run the script again for next release"
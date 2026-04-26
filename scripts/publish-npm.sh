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
pnpm -F @lemmaoracle/spec -F @lemmaoracle/parser -F @lemmaoracle/sdk -F @lemmaoracle/x402 -F @lemmaoracle/mcp build

echo "🔄 Bumping versions..."
cd packages/spec
npm version $VERSION --no-git-tag-version
SPEC_VERSION=$(node -p "require('./package.json').version")
cd ..

cd parser
npm version $VERSION --no-git-tag-version
PARSER_VERSION=$(node -p "require('./package.json').version")
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
SDK_VERSION=$(node -p "require('./package.json').version")
cd ..

cd x402
npm version $VERSION --no-git-tag-version
# Backup original package.json
cp package.json package.json.backup
# Update x402's dependency on sdk to match new version
node -e "
const pkg = require('./package.json');
if (pkg.peerDependencies && pkg.peerDependencies['@lemmaoracle/sdk']) {
  pkg.peerDependencies['@lemmaoracle/sdk'] = '^${SDK_VERSION}';
}
require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
"
X402_VERSION=$(node -p "require('./package.json').version")
cd ..

cd mcp
npm version $VERSION --no-git-tag-version
# Backup original package.json
cp package.json package.json.backup
# Update MCP's dependency on sdk to match new version
node -e "
const pkg = require('./package.json');
pkg.dependencies['@lemmaoracle/sdk'] = '^${SDK_VERSION}';
require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
"
MCP_VERSION=$(node -p "require('./package.json').version")
cd ../..

echo "📝 Updated spec version: $SPEC_VERSION"
echo "📝 Updated parser version: $PARSER_VERSION"
echo "📝 Updated SDK version: $SDK_VERSION"
echo "📝 Updated x402 version: $X402_VERSION"
echo "📝 Updated MCP version: $MCP_VERSION"
echo "📝 Updated SDK dependency to: ^$SPEC_VERSION"
echo "📝 Updated x402 dependency to: ^$SDK_VERSION"
echo "📝 Updated MCP dependency to: ^$SDK_VERSION"

echo "🚀 Publishing @lemmaoracle/spec..."
cd packages/spec
npm publish --access public
cd ..

echo "🚀 Publishing @lemmaoracle/parser..."
cd parser
npm publish --access public
cd ..

echo "🚀 Publishing @lemmaoracle/sdk..."
cd sdk
npm publish --access public
cd ..

echo "🚀 Publishing @lemmaoracle/x402..."
cd x402
npm publish --access public
cd ..

echo "🚀 Publishing @lemmaoracle/mcp..."
cd mcp
npm publish --access public
cd ../..

echo "✅ Published successfully!"

echo "🔄 Restoring SDK, x402, and MCP package.json for development..."
cd packages/sdk
mv package.json.backup package.json
cd ..

cd x402
mv package.json.backup package.json
cd ..

cd mcp
mv package.json.backup package.json
cd ../..

echo ""
echo "📋 Summary:"
echo "  - @lemmaoracle/spec@$SPEC_VERSION"
echo "  - @lemmaoracle/parser@$PARSER_VERSION"
echo "  - @lemmaoracle/sdk@$SDK_VERSION"
echo "  - @lemmaoracle/x402@$X402_VERSION"
echo "  - @lemmaoracle/mcp@$MCP_VERSION"
echo ""
echo "⚠️  Don't forget to:"
echo "  1. Commit the version changes in packages/spec/package.json, packages/parser/package.json, packages/x402/package.json, and packages/mcp/package.json"
echo "  2. Update the SDK, x402, and MCP dependencies manually or run the script again for next release"

#!/bin/bash
# Publish Lemma packages to npm
# Usage:
#   ./scripts/publish-npm.sh [version]              # Publish all packages
#   ./scripts/publish-npm.sh <package> [version]    # Publish single package
#
#   version: patch (default) | minor | major | specific version
#   package: @lemmaoracle/spec | @lemmaoracle/parser | @lemmaoracle/sdk | @lemmaoracle/x402 | @lemmaoracle/mcp

set -e

# All available packages
ALL_PACKAGES=("@lemmaoracle/spec" "@lemmaoracle/parser" "@lemmaoracle/sdk" "@lemmaoracle/x402" "@lemmaoracle/mcp")

# Parse arguments
if [[ $# -eq 0 ]]; then
    TARGET="all"
    VERSION="patch"
elif [[ $1 == patch || $1 == minor || $1 == major ]]; then
    TARGET="all"
    VERSION="$1"
else
    TARGET="$1"
    VERSION="${2:-patch}"
fi

# Validate package name if single
if [[ "$TARGET" != "all" ]]; then
    VALID=false
    for pkg in "${ALL_PACKAGES[@]}"; do
        if [[ "$pkg" == "$TARGET" ]]; then
            VALID=true
            break
        fi
    done
    if [[ "$VALID" != true ]]; then
        echo "❌ Unknown package: $TARGET"
        echo "Available packages: ${ALL_PACKAGES[*]}"
        exit 1
    fi
fi

echo "🚀 Publishing ${TARGET} to npm"
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

# Build filter
if [[ "$TARGET" == "all" ]]; then
    BUILD_FILTER="-F @lemmaoracle/spec -F @lemmaoracle/parser -F @lemmaoracle/sdk -F @lemmaoracle/x402 -F @lemmaoracle/mcp"
else
    BUILD_FILTER="-F ${TARGET}"
fi

echo "📦 Building packages..."
pnpm $BUILD_FILTER build

# Publish helper for packages without dependency modifications
publish_simple() {
    local pkg_name=$1
    local dir=$2

    cd "packages/$dir"

    npm version $VERSION --no-git-tag-version
    local new_version=$(node -p "require('./package.json').version")

    echo "📝 Updated $pkg_name version: $new_version"
    echo "🚀 Publishing $pkg_name..."
    npm publish --access public

    cd ../..
    echo "✅ Published $pkg_name@$new_version"
}

# Publish SDK with spec dependency update
publish_sdk() {
    cd packages/sdk

    npm version $VERSION --no-git-tag-version
    cp package.json package.json.backup

    local spec_version=$(node -p "require('../spec/package.json').version")
    node -e "
const pkg = require('./package.json');
pkg.dependencies['@lemmaoracle/spec'] = '^${spec_version}';
require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
"

    local sdk_version=$(node -p "require('./package.json').version")
    echo "📝 Updated @lemmaoracle/sdk version: $sdk_version"
    echo "🚀 Publishing @lemmaoracle/sdk..."
    npm publish --access public

    cd ../..
    echo "✅ Published @lemmaoracle/sdk@$sdk_version"

    # Restore
    cd packages/sdk && mv package.json.backup package.json && cd ../..
    echo "🔄 Restored SDK package.json for development"
}

# Publish x402 with SDK peer dependency update
publish_x402() {
    cd packages/x402

    npm version $VERSION --no-git-tag-version
    cp package.json package.json.backup

    local sdk_version=$(node -p "require('../sdk/package.json').version")
    node -e "
const pkg = require('./package.json');
if (pkg.peerDependencies && pkg.peerDependencies['@lemmaoracle/sdk']) {
  pkg.peerDependencies['@lemmaoracle/sdk'] = '^${sdk_version}';
}
require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
"

    local x402_version=$(node -p "require('./package.json').version")
    echo "📝 Updated @lemmaoracle/x402 version: $x402_version"
    echo "🚀 Publishing @lemmaoracle/x402..."
    npm publish --access public

    cd ../..
    echo "✅ Published @lemmaoracle/x402@$x402_version"

    # Restore
    cd packages/x402 && mv package.json.backup package.json && cd ../..
    echo "🔄 Restored x402 package.json for development"
}

# Publish MCP with SDK dependency update
publish_mcp() {
    cd packages/mcp

    npm version $VERSION --no-git-tag-version
    cp package.json package.json.backup

    local sdk_version=$(node -p "require('../sdk/package.json').version")
    node -e "
const pkg = require('./package.json');
pkg.dependencies['@lemmaoracle/sdk'] = '^${sdk_version}';
require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
"

    local mcp_version=$(node -p "require('./package.json').version")
    echo "📝 Updated @lemmaoracle/mcp version: $mcp_version"
    echo "🚀 Publishing @lemmaoracle/mcp..."
    npm publish --access public

    cd ../..
    echo "✅ Published @lemmaoracle/mcp@$mcp_version"

    # Restore
    cd packages/mcp && mv package.json.backup package.json && cd ../..
    echo "🔄 Restored MCP package.json for development"
}

if [[ "$TARGET" == "all" ]]; then
    # Publish all packages in dependency order
    publish_simple "@lemmaoracle/spec" "spec"
    publish_simple "@lemmaoracle/parser" "parser"
    publish_sdk
    publish_x402
    publish_mcp

    echo ""
    echo "📋 Summary:"
    echo "  - @lemmaoracle/spec@$(node -p "require('./packages/spec/package.json').version")"
    echo "  - @lemmaoracle/parser@$(node -p "require('./packages/parser/package.json').version")"
    echo "  - @lemmaoracle/sdk@$(node -p "require('./packages/sdk/package.json').version")"
    echo "  - @lemmaoracle/x402@$(node -p "require('./packages/x402/package.json').version")"
    echo "  - @lemmaoracle/mcp@$(node -p "require('./packages/mcp/package.json').version")"
    echo ""
    echo "⚠️  Don't forget to commit the version changes in packages/spec/package.json, packages/parser/package.json, packages/x402/package.json, and packages/mcp/package.json"
else
    # Publish single package
    case "$TARGET" in
        "@lemmaoracle/spec")    publish_simple "$TARGET" "spec" ;;
        "@lemmaoracle/parser")  publish_simple "$TARGET" "parser" ;;
        "@lemmaoracle/sdk")     publish_sdk ;;
        "@lemmaoracle/x402")    publish_x402 ;;
        "@lemmaoracle/mcp")     publish_mcp ;;
    esac

    echo ""
    echo "📋 Published: $TARGET@$(node -p "require('./packages/${TARGET#@lemmaoracle/}/package.json').version")"
fi

echo ""
echo "✅ Done!"

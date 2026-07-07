#!/bin/bash
# Publish Lemma packages to npm
# Usage:
#   ./scripts/publish-npm.sh [version]              # Publish all packages
#   ./scripts/publish-npm.sh <package> [version]    # Publish single package
#
#   version: patch (default) | minor | major | specific version
#   package: @lemmaoracle/spec | @lemmaoracle/parser | @lemmaoracle/sdk | @lemmaoracle/seal | @lemmaoracle/agent | @lemmaoracle/x402 | @lemmaoracle/mcp

set -e

# All available packages
ALL_PACKAGES=("@lemmaoracle/spec" "@lemmaoracle/parser" "@lemmaoracle/sdk" "@lemmaoracle/seal" "@lemmaoracle/agent" "@lemmaoracle/x402" "@lemmaoracle/mcp" "@trust402/sdk")

# Track backup files for cleanup on exit
_BACKUP_FILES=()

cleanup_backups() {
    for f in "${_BACKUP_FILES[@]}"; do
        if [[ -f "$f" ]]; then
            local dir=$(dirname "$f")
            local base=$(basename "$f" .backup)
            mv "$f" "$dir/$base"
            echo "🔄 Restored $dir/$base from backup (cleanup)"
        fi
    done
}
trap cleanup_backups EXIT

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
    BUILD_FILTER="-F @lemmaoracle/spec -F @lemmaoracle/parser -F @lemmaoracle/sdk -F @lemmaoracle/seal -F @lemmaoracle/agent -F @lemmaoracle/x402 -F @lemmaoracle/mcp -F @trust402/sdk"
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
    _BACKUP_FILES+=("$(pwd)/package.json.backup")

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
    # Remove from backup tracking
    _BACKUP_FILES=("${_BACKUP_FILES[@]/$(pwd)/packages/sdk/package.json.backup}")
    echo "🔄 Restored SDK package.json for development"
}

# Publish x402 with SDK peer dependency update
publish_x402() {
    cd packages/x402

    npm version $VERSION --no-git-tag-version
    cp package.json package.json.backup
    _BACKUP_FILES+=("$(pwd)/package.json.backup")

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
    _BACKUP_FILES=("${_BACKUP_FILES[@]/$(pwd)/packages/x402/package.json.backup}")
    echo "🔄 Restored x402 package.json for development"
}

# Publish MCP with SDK dependency update
publish_mcp() {
    cd packages/mcp

    npm version $VERSION --no-git-tag-version
    cp package.json package.json.backup
    _BACKUP_FILES+=("$(pwd)/package.json.backup")

    local sdk_version=$(node -p "require('../sdk/package.json').version")
    node -e "
const pkg = require('./package.json');
pkg.dependencies['@lemmaoracle/sdk'] = '^${sdk_version}';
require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
"

    local mcp_version=$(node -p "require('./package.json').version")

    # Sync version to server.json (top-level + packages[].version)
    node -e "
const fs = require('fs');
const server = JSON.parse(fs.readFileSync('./server.json', 'utf8'));
server.version = '${mcp_version}';
if (server.packages && server.packages[0]) {
  server.packages[0].version = '${mcp_version}';
}
fs.writeFileSync('./server.json', JSON.stringify(server, null, 2) + '\n');
"

    # Sync PACKAGE_VERSION in server.ts
    sed -i "s/^const PACKAGE_VERSION = \".*\";/const PACKAGE_VERSION = \"${mcp_version}\";/" src/server.ts

    echo "📝 Updated @lemmaoracle/mcp version: $mcp_version"
    echo "🚀 Publishing @lemmaoracle/mcp..."
    npm publish --access public

    cd ../..
    echo "✅ Published @lemmaoracle/mcp@$mcp_version"

    # Restore
    cd packages/mcp && mv package.json.backup package.json && cd ../..
    _BACKUP_FILES=("${_BACKUP_FILES[@]/$(pwd)/packages/mcp/package.json.backup}")
    echo "🔄 Restored MCP package.json for development"
}

# Publish agent with SDK and spec dependency update
publish_agent() {
    cd packages/agent

    npm version $VERSION --no-git-tag-version
    cp package.json package.json.backup
    _BACKUP_FILES+=("$(pwd)/package.json.backup")

    local sdk_version=$(node -p "require('../sdk/package.json').version")
    local spec_version=$(node -p "require('../spec/package.json').version")
    node -e "
const pkg = require('./package.json');
pkg.dependencies['@lemmaoracle/sdk'] = '^${sdk_version}';
pkg.dependencies['@lemmaoracle/spec'] = '^${spec_version}';
require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
"

    local agent_version=$(node -p "require('./package.json').version")
    echo "📝 Updated @lemmaoracle/agent version: $agent_version"
    echo "🚀 Publishing @lemmaoracle/agent..."
    npm publish --access public

    cd ../..
    echo "✅ Published @lemmaoracle/agent@$agent_version"

    # Restore
    cd packages/agent && mv package.json.backup package.json && cd ../..
    _BACKUP_FILES=("${_BACKUP_FILES[@]/$(pwd)/packages/agent/package.json.backup}")
    echo "🔄 Restored agent package.json for development"
}

# Publish trust402 with SDK and spec dependency update
publish_trust402() {
    cd packages/trust402

    npm version $VERSION --no-git-tag-version
    cp package.json package.json.backup
    _BACKUP_FILES+=("$(pwd)/package.json.backup")

    local sdk_version=$(node -p "require('../sdk/package.json').version")
    local spec_version=$(node -p "require('../spec/package.json').version")
    node -e "
const pkg = require('./package.json');
pkg.dependencies['@lemmaoracle/sdk'] = '^${sdk_version}';
pkg.dependencies['@lemmaoracle/spec'] = '^${spec_version}';
require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
"

    local trust402_version=$(node -p "require('./package.json').version")
    echo "📝 Updated @trust402/sdk version: $trust402_version"
    echo "🚀 Publishing @trust402/sdk..."
    npm publish --access public

    cd ../..
    echo "✅ Published @trust402/sdk@$trust402_version"

    # Restore
    cd packages/trust402 && mv package.json.backup package.json && cd ../..
    _BACKUP_FILES=("${_BACKUP_FILES[@]/$(pwd)/packages/trust402/package.json.backup}")
    echo "🔄 Restored trust402 package.json for development"
}

# Publish seal with SDK and spec dependency update
publish_seal() {
    cd packages/seal

    npm version $VERSION --no-git-tag-version
    cp package.json package.json.backup
    _BACKUP_FILES+=("$(pwd)/package.json.backup")

    local sdk_version=$(node -p "require('../sdk/package.json').version")
    local spec_version=$(node -p "require('../spec/package.json').version")
    node -e "
const pkg = require('./package.json');
pkg.dependencies['@lemmaoracle/sdk'] = '^${sdk_version}';
pkg.dependencies['@lemmaoracle/spec'] = '^${spec_version}';
require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
"

    local seal_version=$(node -p "require('./package.json').version")
    echo "📝 Updated @lemmaoracle/seal version: $seal_version"
    echo "🚀 Publishing @lemmaoracle/seal..."
    npm publish --access public

    cd ../..
    echo "✅ Published @lemmaoracle/seal@$seal_version"

    # Restore
    cd packages/seal && mv package.json.backup package.json && cd ../..
    _BACKUP_FILES=("${_BACKUP_FILES[@]/$(pwd)/packages/seal/package.json.backup}")
    echo "🔄 Restored seal package.json for development"
}

if [[ "$TARGET" == "all" ]]; then
    # Publish all packages in dependency order
    publish_simple "@lemmaoracle/spec" "spec"
    publish_simple "@lemmaoracle/parser" "parser"
    publish_sdk
    publish_seal
    publish_agent
    publish_trust402
    publish_x402
    publish_mcp

    echo ""
    echo "📋 Summary:"
    echo "  - @lemmaoracle/spec@$(node -p "require('./packages/spec/package.json').version")"
    echo "  - @lemmaoracle/parser@$(node -p "require('./packages/parser/package.json').version")"
    echo "  - @lemmaoracle/sdk@$(node -p "require('./packages/sdk/package.json').version")"
    echo "  - @lemmaoracle/seal@$(node -p "require('./packages/seal/package.json').version")"
    echo "  - @lemmaoracle/agent@$(node -p "require('./packages/agent/package.json').version")"
    echo "  - @trust402/sdk@$(node -p "require('./packages/trust402/package.json').version")"
    echo "  - @lemmaoracle/x402@$(node -p "require('./packages/x402/package.json').version")"
    echo "  - @lemmaoracle/mcp@$(node -p "require('./packages/mcp/package.json').version")"
    echo ""
    echo "⚠️  Don't forget to commit the version changes in packages/spec/package.json, packages/parser/package.json, packages/trust402/package.json, packages/x402/package.json, and packages/mcp/package.json"
else
    # Publish single package
    case "$TARGET" in
        "@lemmaoracle/spec")    publish_simple "$TARGET" "spec" ;;
        "@lemmaoracle/parser")  publish_simple "$TARGET" "parser" ;;
        "@lemmaoracle/sdk")     publish_sdk ;;
        "@lemmaoracle/seal")    publish_seal ;;
        "@lemmaoracle/agent")   publish_agent ;;
        "@trust402/sdk")       publish_trust402 ;;
        "@lemmaoracle/x402")    publish_x402 ;;
        "@lemmaoracle/mcp")     publish_mcp ;;
    esac

    echo ""
    echo "📋 Published: $TARGET@$(node -p "require('./packages/${TARGET#*/}/package.json').version")"
fi

echo ""
echo "✅ Done!"

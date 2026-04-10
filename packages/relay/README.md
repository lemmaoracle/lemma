# Lemma Relay

Node.js relay for Lemma SDK functions that cannot run on edge runtimes.

## Overview

This service provides HTTP endpoints for Lemma SDK operations that require Node.js-specific APIs (like `URL.createObjectURL()` used by `snarkjs`/`ffjavascript`). These operations cannot run on edge runtimes like Cloudflare Workers.

## Deployment

### Northflank

This package is optimized for deployment on Northflank.

#### Docker Deployment

1. Build the Docker image:
   ```bash
   docker build -t lemma-relay .
   ```

2. Push to your registry and deploy to Northflank.

#### Direct Code Deployment

Northflank can also build directly from source using Buildpacks.

### Environment Variables

- `PORT`: Server port (default: 3000)
- `HOST`: Server host (default: 0.0.0.0)

## API Endpoints

### `GET /health`

Health check endpoint. Returns:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### `POST /prover/prove`

Generate a zero-knowledge proof.

**Request Body:**
```json
{
  "apiBase": "https://workers.lemma.workers.dev",
  "apiKey": "optional-api-key",
  "input": {
    "circuitId": "circuit-name",
    "witness": {
      // Circuit-specific witness data
    }
  }
}
```

**Response:**
```json
{
  "proof": "...",
  "publicSignals": [...]
}
```

## Development

```bash
# Install dependencies
pnpm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run linter
npm run lint
```

## Architecture

- Built with Node.js and TypeScript
- Functional programming style (Ramda patterns)
- Stateless design - no database or persistent storage
- All parameters supplied in request body

## Integration

This relay is used by:
- `@lemmaoracle/x402` - Payment facilitation
- Other Lemma services requiring proof generation

## License

Proprietary - Part of the Lemma Oracle ecosystem
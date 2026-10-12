## Why

Cauldron rejects standard Nitro attestation documents and accepts parent-supplied
PCR measurements without independent approval. This prevents a normal run and
does not establish that contribution secrets stayed inside the approved enclave.

## What Changes

- Read certificates from the signed Nitro payload and normalize the root-first CA bundle.
- Require independently measured golden PCR0/1/2 for phase2 and verify, before AWS provisioning.
- Hash all enclave image inputs and reject incomplete build-input manifests.
- Correct the public-beacon guarantee and add regression coverage.

## Capabilities

### Modified Capabilities
- `cauldron-phase2-launch`: require attestation verification with an independent trust policy.

## Impact

Runs using the unmeasured bundled golden manifest will stop until the operator
provides independently approved measurements. No AWS services or circuit interfaces are added.

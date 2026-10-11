#!/usr/bin/env bash
# 回路の build.sh から source する。Groth16 phase 2 を Nitro Enclave で行う。
# 使い方: lemma_phase2 <回路のパス（拡張子なし）> [ptau]
# AWS 認証は aws CLI に任せる。SSH 鍵は cauldron が実行ごとに作って消す。

lemma_phase2() {
  local circuit="${1:?circuit path required}"
  local ptau="${2:-}"
  local here
  here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  local cmd=(node "$here/cauldron.mjs" phase2 --circuit "$circuit")
  if [ -n "$ptau" ]; then
    cmd+=(--ptau "$ptau")
  fi
  echo "→ phase 2 (Nitro Enclave): $circuit"
  "${cmd[@]}"
}

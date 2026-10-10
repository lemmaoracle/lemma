#!/bin/sh
# vsock 5001 で待ち、1接続ごとに serve.mjs を起動する。
exec socat VSOCK-LISTEN:5001,reuseaddr,fork EXEC:"node /app/serve.mjs"

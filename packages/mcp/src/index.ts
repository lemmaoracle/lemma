#!/usr/bin/env node

import { startServer } from "./server.js";

startServer().catch((_error: unknown) => process.exit(1));

export { startServer } from "./server.js";

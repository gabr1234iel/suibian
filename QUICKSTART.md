# 1. Configure enclave for trading (REQUIRED)
sh configure_enclave.sh trading

# 2. Commit the generated changes
git add -A && git commit -m "Configure trading endpoints"

# 3. Build locally to test
cd src/nautilus-server
cargo build --no-default-features --features trading

# 4. Build enclave
cd ../..
make EXAMPLE=trading

# 5. Deploy and run
make run
sh expose_enclave.sh
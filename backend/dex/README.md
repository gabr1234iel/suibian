# build and publish
sui move build
sui client publish --gas-budget 100000000

# Check your current coins, get SUI object ID
sui client gas

# bootstrap the pool
sui client call \
  --package 0xf6c779446cf6a60ecf2f158006130a047066583e98caa9fa7ad038cac3a32f82 \
  --module dex \
  --function bootstrap_pool \
  --args 0xdb0eb25e57a67e8e606f3b42dd68be6fabafb193c0d90dfd1b47e88982ed321c  0xe0fe61c887fc237a80b611866d40ed476755ce9051c52e4a0576ef34cdf71c2f \
  --gas-budget 10000000
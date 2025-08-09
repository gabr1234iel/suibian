# AWS Nitro Enclave Deployment Guide

Complete reproducible steps to deploy the Nautilus Trading Agent in AWS Nitro Enclave.

## Prerequisites

- AWS CLI configured with proper credentials
- macOS/Linux environment for local setup
- SSH key pair for EC2 access

## Step 1: Local Setup and Configuration

### 1.1 Configure Enclave
```bash
# Set environment variables
export KEY_PAIR=nautilus-trading-keypair  # Replace with your key name
export REGION=us-east-1                   # Optional: change region

# Run configuration (choose 'n' for no secrets when prompted)
./configure_enclave.sh trading
```

### 1.2 Build Locally (for PCR comparison)
```bash
# Build the enclave image locally
make EXAMPLE=trading

# Note the PCR values from out/nitro.pcrs - you'll compare these later
cat out/nitro.pcrs
```

## Step 2: EC2 Instance Setup

### 2.1 SSH into EC2 Instance
```bash
# Get the public IP from the configure_enclave.sh output
ssh -i ~/nautilus-trading-keypair.pem ec2-user@YOUR_PUBLIC_IP
```

### 2.2 Initial Setup on EC2
```bash
# Clone the repository
git clone https://github.com/your-repo/nautilus-trading-agent.git
cd nautilus-trading-agent

# Build the enclave
make EXAMPLE=trading

# Compare PCR values (PCR2 should match local build)
cat out/nitro.pcrs
```

## Step 3: Fix VSOCK Issues

### 3.1 Compile socat with VSOCK Support
The default socat doesn't support VSOCK. Compile a new version:

```bash
# Install development tools
sudo yum groupinstall -y "Development Tools"
sudo yum install -y openssl-devel readline-devel

# Download and compile socat with VSOCK
cd /tmp
wget http://www.dest-unreach.org/socat/download/socat-1.7.4.4.tar.gz
tar xzf socat-1.7.4.4.tar.gz
cd socat-1.7.4.4
./configure --enable-vsock
make
sudo make install

# Verify VSOCK support
/usr/local/bin/socat -V | grep -i vsock
# Should show: #define WITH_VSOCK 1
```

### 3.2 Update expose_enclave.sh
```bash
cd ~/nautilus-trading-agent

# Update expose_enclave.sh to use the new socat
sed -i 's/socat/\/usr\/local\/bin\/socat/g' expose_enclave.sh
```

## Step 4: Run the Enclave

### 4.1 Check Allocator Service
```bash
# Ensure allocator service is running
sudo systemctl status nitro-enclaves-allocator
sudo systemctl start nitro-enclaves-allocator  # if not running
```

### 4.2 Start the Enclave
```bash
# Run the enclave
make run

# Expected output should show:
# Started enclave with enclave-cid: XX, memory: 512 MiB, cpu-ids: [1, 3]
# Note the CID number (e.g., 18)
```

### 4.3 Expose the Enclave
```bash
# Run the exposure script
./expose_enclave.sh

# Or manually if needed:
ENCLAVE_CID=18  # Use your actual CID
echo '{}' > secrets.json
cat secrets.json | /usr/local/bin/socat - VSOCK-CONNECT:$ENCLAVE_CID:7777 &
/usr/local/bin/socat TCP4-LISTEN:3000,reuseaddr,fork VSOCK-CONNECT:$ENCLAVE_CID:3000 &
```

## Step 5: Test the Trading Agent

### 5.1 Test Locally on EC2
```bash
# Test basic connectivity
curl http://localhost:3000/ping
# Expected: "Trading Agent TEE v1.0 - Ready!"
```

### 5.2 Test from External Machine
```bash
# Replace YOUR_PUBLIC_IP with actual EC2 public IP
curl http://YOUR_PUBLIC_IP:3000/ping

# Initialize wallet
curl -X POST http://YOUR_PUBLIC_IP:3000/init_wallet \
  -H "Content-Type: application/json" \
  -d '{"payload": {"owner_address": "0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5"}}'

# Check wallet status
curl -X POST http://YOUR_PUBLIC_IP:3000/wallet_status \
  -H "Content-Type: application/json" \
  -d '{"payload": {}}'
```

## Step 6: Trading Operations

### 6.1 Initialize Wallet
```bash
curl -X POST http://YOUR_PUBLIC_IP:3000/init_wallet \
  -H "Content-Type: application/json" \
  -d '{"payload": {"owner_address": "YOUR_OWNER_ADDRESS"}}'
```

### 6.2 Deposit Funds
Deposit SUI and USDC to the wallet address returned from init_wallet.

### 6.3 Execute Trades
```bash
# Sell SUI for USDC
curl -X POST http://YOUR_PUBLIC_IP:3000/execute_trade \
  -H "Content-Type: application/json" \
  -d '{"payload": {"action": "sell_sui", "amount": 90000000, "min_output": 500000}}'

# Buy SUI with USDC  
curl -X POST http://YOUR_PUBLIC_IP:3000/execute_trade \
  -H "Content-Type: application/json" \
  -d '{"payload": {"action": "buy_sui", "amount": 500000, "min_output": 80000000}}'
```

## Troubleshooting

### Common Issues

1. **E29/E39 Enclave Error**
   ```bash
   # Check allocator service
   sudo systemctl status nitro-enclaves-allocator
   sudo systemctl restart nitro-enclaves-allocator
   
   # Terminate existing enclaves
   sudo nitro-cli terminate-enclave --all
   ```

2. **VSOCK Connection Failed**
   - Ensure you compiled socat with VSOCK support
   - Check that `/usr/local/bin/socat -V | grep -i vsock` shows `#define WITH_VSOCK 1`
   - Verify enclave is running with `nitro-cli describe-enclaves`

3. **Port 3000 Not Accessible**
   - Check security group allows port 3000 inbound
   - Verify socat is forwarding: `ps aux | grep socat`
   - Test locally first with `curl http://localhost:3000/ping`

4. **Different PCR Values**
   - PCR0/PCR1 differences are normal (different build environments)
   - PCR2 should be identical between local and EC2 builds
   - If PCR2 differs, code/build process has changed

### Logs and Debugging
```bash
# Check enclave logs
sudo cat /var/log/nitro_enclaves/err*.log

# Check system logs
sudo journalctl -u nitro-enclaves-allocator

# Check running processes
ps aux | grep socat
ps aux | grep nitro
```

## Security Notes

- The enclave generates ephemeral keypairs that exist only in memory
- Private keys never leave the enclave
- Only the owner address can withdraw funds
- PCR attestation ensures code integrity

## Complete API Reference

### GET Endpoints

#### Health Check
```bash
# Basic ping
curl http://YOUR_PUBLIC_IP:3000/ping
# Response: "Trading Agent TEE v1.0 - Ready!"

# Health status
curl http://YOUR_PUBLIC_IP:3000/health
# Response: {"status": "ok", "timestamp": "..."}

# Get attestation document
curl http://YOUR_PUBLIC_IP:3000/attestation
# Response: {"attestation_document": "base64_encoded_data", ...}
```

### POST Endpoints

#### 1. Initialize Wallet
```bash
curl -X POST http://YOUR_PUBLIC_IP:3000/init_wallet \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "owner_address": "0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5"
    }
  }'
```
**Response:**
```json
{
  "response": {
    "data": {
      "wallet_address": "0x123abc...",
      "owner": "0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5",
      "message": "Wallet initialized. Fund this address with SUI: 0x123abc..."
    },
    "timestamp_ms": 1703001234567,
    "intent": "ProcessData"
  },
  "signature": "0xabc123..."
}
```

#### 2. Check Wallet Status
```bash
curl -X POST http://YOUR_PUBLIC_IP:3000/wallet_status \
  -H "Content-Type: application/json" \
  -d '{"payload": {}}'
```
**Response:**
```json
{
  "response": {
    "data": {
      "wallet_address": "0x123abc...",
      "sui_balance": 1000000000,
      "usdc_balance": 5000000,
      "pool_info": {
        "sui_reserve": 150000000000,
        "usdc_reserve": 900000000
      }
    }
  }
}
```

#### 3. Execute Trade
```bash
# Sell SUI for USDC (0.09 SUI expecting ~0.55 USDC)
curl -X POST http://YOUR_PUBLIC_IP:3000/execute_trade \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "action": "sell_sui", 
      "amount": 90000000, 
      "min_output": 500000
    }
  }'

# Buy SUI with USDC (0.5 USDC expecting ~0.08 SUI)
curl -X POST http://YOUR_PUBLIC_IP:3000/execute_trade \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "action": "buy_sui", 
      "amount": 500000, 
      "min_output": 80000000
    }
  }'
```
**Response:**
```json
{
  "response": {
    "data": {
      "transaction_digest": "0x456def...",
      "action": "sell_sui",
      "input_amount": 90000000,
      "output_amount": 550000,
      "new_sui_balance": 910000000,
      "new_usdc_balance": 5550000
    }
  }
}
```

#### 4. Withdraw Funds (Owner Only)
```bash
curl -X POST http://YOUR_PUBLIC_IP:3000/withdraw \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "recipient": "0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5",
      "amount": 500000000,
      "coin_type": "sui"
    }
  }'
```

#### 5. Simple Transfer (Test Signature)
```bash
curl -X POST http://YOUR_PUBLIC_IP:3000/simple_transfer \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "recipient": "0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5",
      "amount": 100000000
    }
  }'
```

#### 6. Subscription Withdraw (Subscribers Only)
```bash
curl -X POST http://YOUR_PUBLIC_IP:3000/subscription_withdraw \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "recipient": "0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5",
      "amount": 100000000,
      "coin_type": "sui"
    }
  }'
```

### DEX Pool Constants

The trading agent uses these devnet constants:
- **Pool ID:** `0xc5f6cc6b19acbfab90f17b1e5b0c2a7bd18e0b0a1a5a3b3c5d5e7f8a9b0c1d2e`
- **DEX Package:** `0x742d35cc6ba1c4bf0bb4d8c7d3c4b0ce15c4c51eb8b6e7e1a1d4b5c3b4f6a7b8`
- **USDC Type:** `0x742d35cc6ba1c4bf0bb4d8c7d3c4b0ce15c4c51eb8b6e7e1a1d4b5c3b4f6a7b8::usdc::USDC`

### Amount Units
- **SUI:** 1 SUI = 1,000,000,000 MIST (9 decimals)
- **USDC:** 1 USDC = 1,000,000 µUSDC (6 decimals)

### Example Trading Flow
```bash
# 1. Initialize wallet
curl -X POST http://YOUR_PUBLIC_IP:3000/init_wallet \
  -H "Content-Type: application/json" \
  -d '{"payload": {"owner_address": "0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5"}}'

# 2. Fund wallet (use returned address)
# Transfer SUI and USDC to the wallet address

# 3. Check balance
curl -X POST http://YOUR_PUBLIC_IP:3000/wallet_status \
  -H "Content-Type: application/json" \
  -d '{"payload": {}}'

# 4. Execute trades
curl -X POST http://YOUR_PUBLIC_IP:3000/execute_trade \
  -H "Content-Type: application/json" \
  -d '{"payload": {"action": "sell_sui", "amount": 90000000, "min_output": 500000}}'

# 5. Withdraw profits
curl -X POST http://YOUR_PUBLIC_IP:3000/withdraw \
  -H "Content-Type: application/json" \
  -d '{"payload": {"recipient": "0x91d6de6ad4363ec6947bd621aedd2e0ded77cbd1b8607a46e237ebfd082697f5", "amount": 500000000, "coin_type": "sui"}}'
```

## API Documentation

See [TRADE.md](TRADE.md) for complete API documentation and trading examples.
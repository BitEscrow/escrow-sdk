#!/usr/bin/env bash

# Array of networks
networks=(
  "mutiny"
  "regtest"
  "signet"
  "testnet"
)

# Array of demo paths
demo_paths=(
  "01_create_client.ts"
  "02_create_signer.ts"
  "03_build_proposal.ts"
  "04_roles_and_endorse.ts"
  "05_create_contract.ts"
  "06_request_account.ts"
  "07_deposit_funds.ts"
  "08_check_contract.ts"
  "09_settle_contract.ts"
)

DEFAULT_NET="mutiny"
DEFAULT_IDX=9

## Configure input arguments.
[ -n "$1" ] && NETWORK="$1"  || NETWORK="$DEFAULT_NET"
[ -n "$2" ] && SELECTED="$2" || SELECTED="$DEFAULT_IDX"

# User input
selection=$(($SELECTED - 1))

# Flag to track if a match is found
match_found=false

# Loop through the array and check for a match
for str in "${networks[@]}"; do
  if [ "$str" == "$NETWORK" ]; then
    match_found=true
    break
  fi
done

if [ "$match_found" != true ]; then
  echo "Invalid network selection: $NETWORK"
  echo "Valid networks are mutiny, signet, or testnet"
  exit 1
fi

# Check if the script selection is valid
if (( selection < 0 )) || (( selection >= ${#demo_paths[@]} )); then
  echo "Invalid script selection: $selection" && exit 1
fi

# Construct the file path
filepath=${demo_paths[$selection]}
fullpath="demo/$filepath"

# Output the full path
echo "Executing demo script '$filepath' on $NETWORK network ..."

npm run load $fullpath $NETWORK

## CREATION

```
# Example: Convert "My Awesome Agent" to hex -> 4d7920417765736f6d65204167656e74
# Example: Convert "It analyzes market data" to hex -> 497420616e616c797a6573206d61726b65742064617461

sui client call \
  --package $PACKAGE_ID \
  --module marketplace \
  --function create_collectible \
  --args 0x4d7920417765736f6d65204167656e74 0x497420616e616c797a6573206d61726b65742064617461 \
  --gas-budget 50000000
```

## LIST ITEM

```
# The price is in MIST. 100,000,000 MIST = 0.1 SUI
sui client call \
  --package $PACKAGE_ID \
  --module marketplace \
  --function list_item \
  --args $COLLECTIBLE_ID 100000000 \
  --gas-budget 50000000
```

## BUY ITEM

```
sui client call \
  --package $PACKAGE_ID \
  --module marketplace \
  --function buy_item \
  --args $LISTING_ID $COIN_ID \
  --gas-budget 50000000
```

## DELIST ITEM

```
sui client call \
  --package $PACKAGE_ID \
  --module marketplace \
  --function delist_item \
  --args $LISTING_ID \
  --gas-budget 50000000
```

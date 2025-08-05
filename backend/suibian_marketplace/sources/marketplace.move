module suibian_marketplace::marketplace {
    use sui::coin::Coin;
    use sui::sui::SUI;
    use sui::event;
    use std::string::String;

    // Import our own Collectible module
    use suibian_marketplace::collectible::{Self, Collectible};

    // An error code for when a buyer doesn't pay enough
    const ENotEnough: u64 = 1;
    // An error code for when someone tries to delist an item they don't own
    const ENotSeller: u64 = 2;

    /// A listing object that holds an item for sale and the item itself.
    public struct Listing has key, store {
        id: sui::object::UID,
        // The actual item being sold (stored inside the listing)
        item: Collectible,
        // The price in SUI
        price: u64,
        // The original seller, who gets the funds
        seller: address
    }

    public struct CollectibleCreated has copy, drop {
        item_id: sui::object::ID,
        creator: address,
        name: String,
        description: String,
        timestamp: u64
    }

    /// Event emitted when an item is listed for sale
    public struct ItemListed has copy, drop {
        listing_id: sui::object::ID,
        item_id: sui::object::ID,
        seller: address,
        price: u64,
        timestamp: u64
    }

    /// Event emitted when an item is purchased
    public struct ItemPurchased has copy, drop {
        listing_id: sui::object::ID,
        item_id: sui::object::ID,
        seller: address,
        buyer: address,
        price: u64,
        timestamp: u64
    }

    /// Event emitted when an item is delisted
    public struct ItemDelisted has copy, drop {
        listing_id: sui::object::ID,
        item_id: sui::object::ID,
        seller: address,
        timestamp: u64
    }

    /// --- Entry Functions ---

    // Create a collectible using the collectible module's mint function
    public entry fun create_collectible(
        name: vector<u8>, 
        description: vector<u8>, 
        ctx: &mut sui::tx_context::TxContext
    ) {
        let creator = sui::tx_context::sender(ctx);
        
        // Use the collectible module's mint function
        collectible::mint(name, description, ctx);

        // Note: We can't easily emit an event with the item details here
        // because the mint function transfers the item directly to the creator
        // and we don't have access to its ID or fields from this module.
        // You might want to add event emission to the collectible::mint function itself.
    }

    /// List an item for sale. The seller sends their Collectible and a price.
    public entry fun list_item(
        item: Collectible,
        price: u64,
        ctx: &mut sui::tx_context::TxContext
    ) {
        let seller = sui::tx_context::sender(ctx);
        let item_id = sui::object::id(&item);

        let listing = Listing {
            id: sui::object::new(ctx),
            item, // Store the item directly inside the listing
            price,
            seller,
        };

        let listing_id = sui::object::id(&listing);

        // Emit event for indexers
        event::emit(ItemListed {
            listing_id,
            item_id,
            seller,
            price,
            timestamp: sui::tx_context::epoch_timestamp_ms(ctx)
        });

        // Transfer the Listing object (containing the item) to the seller
        sui::transfer::public_transfer(listing, seller);
    }

    /// Buy a listed item. The buyer provides the Listing object and payment.
    public entry fun buy_item(
        listing: Listing,
        mut payment: Coin<SUI>,
        ctx: &mut sui::tx_context::TxContext
    ) {
        // Verify payment is sufficient
        assert!(sui::coin::value(&payment) >= listing.price, ENotEnough);

        let buyer = sui::tx_context::sender(ctx);
        let listing_id = sui::object::id(&listing);
        let item_id = sui::object::id(&listing.item);
        let seller = listing.seller;
        let price = listing.price;

        // Send the payment to the seller
        let price_coin = sui::coin::split(&mut payment, listing.price, ctx);
        sui::transfer::public_transfer(price_coin, listing.seller);

        // Return the buyer's change if any
        if (sui::coin::value(&payment) > 0) {
            sui::transfer::public_transfer(payment, buyer);
        } else {
            sui::coin::destroy_zero(payment);
        };

        // Extract the item from the listing and transfer it to the buyer
        let Listing { id, item, price: _, seller: _ } = listing;
        sui::transfer::public_transfer(item, buyer);

        // Emit event for indexers
        event::emit(ItemPurchased {
            listing_id,
            item_id,
            seller,
            buyer,
            price,
            timestamp: sui::tx_context::epoch_timestamp_ms(ctx)
        });
        
        // Destroy the listing object
        sui::object::delete(id);
    }

    /// Delist an item from the marketplace. Only the seller can call this.
    public entry fun delist_item(
        listing: Listing,
        ctx: &mut sui::tx_context::TxContext
    ) {
        // Verify that the caller is the seller
        assert!(listing.seller == sui::tx_context::sender(ctx), ENotSeller);

        let listing_id = sui::object::id(&listing);
        let item_id = sui::object::id(&listing.item);
        let seller = listing.seller;

        // Extract the item from the listing and return it to the seller
        let Listing { id, item, price: _, seller: seller_addr } = listing;
        sui::transfer::public_transfer(item, seller_addr);

        // Emit event for indexers
        event::emit(ItemDelisted {
            listing_id,
            item_id,
            seller,
            timestamp: sui::tx_context::epoch_timestamp_ms(ctx)
        });
        
        // Destroy the listing object
        sui::object::delete(id);
    }

    /// --- View Functions for Additional Data ---

    /// Get listing details (useful for indexers and frontends)
    public fun get_listing_details(listing: &Listing): (sui::object::ID, u64, address) {
        (sui::object::id(&listing.item), listing.price, listing.seller)
    }

    /// Get item ID from listing (useful for queries)
    public fun get_item_id(listing: &Listing): sui::object::ID {
        sui::object::id(&listing.item)
    }
}
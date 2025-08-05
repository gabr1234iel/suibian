module suibian_marketplace::collectible {
    use std::string::String;

    /// The asset we will be trading. It's a simple object with a name
    /// and a description.
    public struct Collectible has key, store {
        id: sui::object::UID,
        name: String,
        description: String
    }

    public struct CollectibleMinted has copy, drop {
        item_id: sui::object::ID,
        creator: address,
        name: String,
        description: String,
        timestamp: u64
    }

    // Update the mint function to emit events
    public entry fun mint(
        name: vector<u8>,
        description: vector<u8>,
        ctx: &mut sui::tx_context::TxContext
    ) {
        let collectible = Collectible {
            id: sui::object::new(ctx),
            name: std::string::utf8(name),
            description: std::string::utf8(description)
        };
        
        let item_id = sui::object::id(&collectible);
        let creator = sui::tx_context::sender(ctx);
        
        // Emit event
        sui::event::emit(CollectibleMinted {
            item_id,
            creator,
            name: collectible.name,
            description: collectible.description,
            timestamp: sui::tx_context::epoch_timestamp_ms(ctx)
        });

        sui::transfer::public_transfer(collectible, creator);
    }
}
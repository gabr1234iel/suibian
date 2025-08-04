#[test_only]
module avs_on_chain::validator_registry_tests {
    use avs_on_chain::validator_registry;
    use sui::test_scenario;

    #[test]
    fun test_simple() {
        let mut scenario = test_scenario::begin(@0x1);
        
        // Just test that we can call test_init without crashing
        validator_registry::test_init(test_scenario::ctx(&mut scenario));
        
        test_scenario::end(scenario);
    }
}
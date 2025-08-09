import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { fromHex, toHex } from "@mysten/sui/utils";

export class SealPolicyClient {
  private suiClient: SuiClient;
  private packageId: string;

  constructor(packageId: string) {
    this.suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });
    this.packageId = packageId;
  }

  /**
   * Create a new Seal policy for a Google ID
   */
  async createPolicyForGoogleId(
    googleId: string,
    signer: Ed25519Keypair,
    capId: string,
    threshold: number = 2
  ): Promise<string> {
    const tx = new Transaction();

    // Hash the Google ID to use as identity
    const encoder = new TextEncoder();
    const googleIdBytes = encoder.encode(googleId);

    tx.moveCall({
      target: `${this.packageId}::policy_manager::create_policy`,
      arguments: [
        tx.object(capId),
        tx.pure.vector("u8", Array.from(googleIdBytes)),
        tx.pure.u8(threshold),
      ],
    });

    const result = await this.suiClient.signAndExecuteTransaction({
      transaction: tx,
      signer,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });

    // Extract the policy ID from the transaction result
    const policyObject = result.objectChanges?.find(
      (change) =>
        change.type === "created" && change.objectType.includes("SealPolicy")
    );

    if (policyObject && "objectId" in policyObject) {
      console.log(`✅ Seal policy created: ${policyObject.objectId}`);
      return policyObject.objectId;
    }

    throw new Error("Failed to create Seal policy");
  }

  /**
   * Get policy information
   */
  async getPolicyInfo(policyId: string) {
    const policyObject = await this.suiClient.getObject({
      id: policyId,
      options: { showContent: true },
    });

    return policyObject;
  }
}

import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from "web3";

export default class WalletConnectConnector {
  private provider: WalletConnectProvider | null = null;
  private web3: Web3 | null = null;
  private accounts: string[] = [];

  constructor() {
    this.provider = null;
    this.web3 = null;
    this.accounts = [];
  }

  async connect() {
    try {
      // Initialize WalletConnect Provider
      this.provider = new WalletConnectProvider({
        infuraId: "27e484dcd9e3efcfd25a83a78777cdf1", // Default Infura ID
        rpc: {
          1: "https://mainnet.infura.io/v3/27e484dcd9e3efcfd25a83a78777cdf1",
          1666600000: "https://api.harmony.one",
          1666700000: "https://api.s0.b.hmny.io",
        },
        qrcode: true,
        qrcodeModalOptions: {
          mobileLinks: [
            "rainbow",
            "metamask",
            "argent",
            "trust",
            "imtoken",
            "pillar",
          ],
        },
      });

      // Enable session (triggers QR Code modal)
      await this.provider.enable();

      // Create Web3 instance
      this.web3 = new Web3(this.provider as any);
      
      // Get connected accounts
      this.accounts = await this.web3.eth.getAccounts();
      
      if (this.accounts.length === 0) {
        throw new Error("No accounts found");
      }

      // Subscribe to events
      this.subscribeToEvents();

      return {
        success: true,
        address: this.accounts[0],
      };
    } catch (error) {
      console.error("WalletConnect connection error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async disconnect() {
    if (this.provider) {
      try {
        await this.provider.disconnect();
      } catch (error) {
        console.error("WalletConnect disconnect error:", error);
      }
    }
    this.provider = null;
    this.web3 = null;
    this.accounts = [];
  }

  getAccounts() {
    return this.accounts;
  }

  getWeb3() {
    return this.web3;
  }

  getProvider() {
    return this.provider;
  }

  isConnected() {
    return this.provider !== null && this.accounts.length > 0;
  }

  private subscribeToEvents() {
    if (!this.provider) return;

    // Subscribe to accounts change
    this.provider.on("accountsChanged", (accounts: string[]) => {
      this.accounts = accounts;
      console.log("WalletConnect accountsChanged:", accounts);
    });

    // Subscribe to chainId change
    this.provider.on("chainChanged", (chainId: number) => {
      console.log("WalletConnect chainChanged:", chainId);
    });

    // Subscribe to disconnect
    this.provider.on("disconnect", (code: number, reason: string) => {
      console.log("WalletConnect disconnected:", code, reason);
      this.provider = null;
      this.web3 = null;
      this.accounts = [];
    });
  }
}

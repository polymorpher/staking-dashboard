<template>
  <SessionFrame title="Use WalletConnect" image="account">
    <div class="session-container">
      <h2 class="session-title">Connect with WalletConnect</h2>
      <div v-if="!connected" class="session-main">
        <TmBtn
          id="connect-walletconnect"
          class="session-button"
          value="Connect Wallet"
          @click.native="connectWallet"
          :loading="connecting"
        />
        <p v-if="error" class="error-message">{{ error }}</p>
        <p class="footnote">
          Scan the QR code with your mobile wallet to connect
        </p>
      </div>
      <div v-else class="session-main">
        <div class="address-container">
          <h3>Connected Account</h3>
          <p class="address">{{ address }}</p>
        </div>
        <TmBtn
          id="sign-in-walletconnect"
          class="session-button"
          value="Sign In"
          @click.native="signIn"
          color="primary"
        />
        <TmBtn
          id="disconnect-walletconnect"
          class="session-button"
          value="Disconnect"
          @click.native="disconnect"
          type="secondary"
        />
      </div>
    </div>
  </SessionFrame>
</template>

<script>
import { mapState } from "vuex";
import SessionFrame from "common/SessionFrame";
import TmBtn from "common/TmBtn";
import WalletConnectConnector from "../../connectors/walletconnect";

export default {
  name: "tm-session-wallet-connect",
  components: {
    SessionFrame,
    TmBtn
  },
  data: () => ({
    connector: null,
    connecting: false,
    connected: false,
    address: "",
    error: null
  }),
  computed: {
    ...mapState(["session"])
  },
  mounted() {
    this.connector = new WalletConnectConnector();
  },
  beforeDestroy() {
    if (this.connector && this.connected) {
      this.connector.disconnect();
    }
  },
  methods: {
    async connectWallet() {
      this.connecting = true;
      this.error = null;

      try {
        const result = await this.connector.connect();
        
        if (result.success) {
          this.connected = true;
          this.address = result.address;
          
          // Save the connector instance to the store for transaction signing
          await this.$store.dispatch("saveWalletConnectConnector", {
            connector: this.connector
          });
        } else {
          this.error = result.error || "Failed to connect";
        }
      } catch (error) {
        this.error = error.message || "An unexpected error occurred";
        console.error("WalletConnect error:", error);
      } finally {
        this.connecting = false;
      }
    },
    async signIn() {
      if (!this.connected || !this.address) {
        this.error = "Not connected to wallet";
        return;
      }

      try {
        await this.$store.dispatch("signIn", {
          sessionType: "walletconnect",
          address: this.address,
          networkId: "harmony-mainnet"
        });
        
        this.$router.push("/");
      } catch (error) {
        this.error = error.message || "Failed to sign in";
        console.error("Sign in error:", error);
      }
    },
    async disconnect() {
      if (this.connector) {
        await this.connector.disconnect();
        this.connected = false;
        this.address = "";
        
        // Clear the connector instance from the store
        await this.$store.dispatch("saveWalletConnectConnector", {
          connector: null
        });
      }
    }
  }
};
</script>

<style scoped>
.session-container {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.session-main {
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.session-button {
  width: 100%;
  margin: 0.5rem 0;
}

.address-container {
  background: var(--app-fg);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  width: 100%;
  text-align: center;
}

.address {
  word-break: break-all;
  font-family: monospace;
  font-size: 0.9rem;
}

.error-message {
  color: var(--error);
  margin: 1rem 0;
}

.footnote {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: var(--dim);
  text-align: center;
}
</style>

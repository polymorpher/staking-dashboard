// import { Harmony } from "@harmony-js/core"
// import { INetworkConfig } from "@/vuex/modules/connection"
// const { ChainID, ChainType } = require("@harmony-js/utils")
// // const { Delegate, StakingTransaction } = require("@harmony-js/staking")
// import TransportWebUSB from "@ledgerhq/hw-transport-webusb"
// import HarmonyApp from "@/vuex/modules/harmony-ledger"
// import { Unit } from "@harmony-js/utils"
//
// // const URL_TESTNET = `https://api.s0.b.hmny.io`;
// const URL_MAINNET = `https://api.s0.t.hmny.io`
//
// export default class LedgerManager {
//   networkConfig?: INetworkConfig
//
//   harmony = new Harmony(
//     // rpc url
//     URL_MAINNET,
//     {
//       // chainType set to Harmony
//       chainType: ChainType.Harmony,
//       chainId: ChainID.HmyMainnet
//     }
//   )
//
//   setNetwork(network: INetworkConfig) {
//     const { rpc_url, chain_id } = network
//
//     this.networkConfig = network
//
//     this.harmony = new Harmony(rpc_url, {
//       chainType: ChainType.Harmony,
//       chainId: chain_id
//     } as any)
//   }
//
//   async send(fee: any, transactionData: any) {
//     const transport = await TransportWebUSB.create()
//     const app = new HarmonyApp(transport)
//
//     const shardId = 0
//     const value = transactionData.amounts[0].amount
//
//     const txn = this.harmony.transactions.newTx({
//       to: transactionData.toAddress,
//       value: new Unit(value).asSzabo().toWei(),
//       gasLimit: fee.gasEstimate,
//       gasPrice: new Unit(fee.gasPrice.amount).asGwei().toWei(),
//       shardID: shardId,
//       toShardID: 0
//       //nonce: "0x"
//     })
//
//     const signedTxn = await app.signTransaction(
//       txn,
//       this.harmony.chainId,
//       shardId,
//       this.harmony.messenger
//     )
//
//     const rawTransaction = signedTxn.getRawTransaction();
//
//     const callbackFunc = async () => {
//       // Frontend received back the signedTxn and do the followings to Send transaction.
//       signedTxn
//         .observed()
//         .on("transactionHash", (txnHash: any) => {
//           console.log(txnHash)
//         })
//         .on("receipt", (receipt: any) => {
//           console.log(receipt)
//         })
//         .on("cxReceipt", (receipt: any) => {
//           console.log(receipt)
//         })
//         .on("error", (error: any) => {
//           console.log(error)
//         })
//
//       // send the txn, get [Transaction, transactionHash] as result
//
//       const recoverTransaction = this.harmony.transactions.recover(rawTransaction);
//
//       const [sentTxn, txnHash] = await recoverTransaction.sendTransaction()
//
//       // to confirm the result if it is already there
//
//       const confiremdTxn = await sentTxn.confirm(txnHash)
//
//       try {
//         if (!confiremdTxn.isCrossShard()) {
//           if (confiremdTxn.isConfirmed()) {
//             console.log("Normal transaction")
//             console.log(`${txnHash} is confirmed`)
//           }
//         }
//         if (confiremdTxn.isConfirmed() && confiremdTxn.isCxConfirmed()) {
//           console.log("Cross-Shard transaction")
//           console.log(`${txnHash} is confirmed`)
//         }
//       } catch (err) {
//         console.error(err)
//       }
//
//       return { txhash: txnHash }
//     }
//
//     return { included: callbackFunc }
//   }
// }

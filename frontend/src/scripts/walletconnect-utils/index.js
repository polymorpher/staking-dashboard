import Web3 from 'web3';
import { HarmonyAddress, BN } from "@harmony-js/crypto"
import {abi} from "../metamask-utils/staking-abi";
import { Unit } from "@harmony-js/utils"

const CHAIN_ID_TESTNET = 1666700000
const CHAIN_ID_MAINNET = 1666600000

const isNetworkEqual = (networkConfig, chainId) => {
    if (networkConfig.id === 'harmony-testnet' && chainId === CHAIN_ID_TESTNET) {
        return true
    }

    if (networkConfig.id === 'harmony' && chainId === CHAIN_ID_MAINNET) {
        return true
    }

    return false
}

export const processWalletConnectMessage = async (
    sendData,
    networkConfig,
    from,
    connector
) => {
    const { type, fee, gasPrice: gasPriceData, validatorAddress, amount:amountData, amounts, toAddress } = sendData
    const { gasEstimate } = fee

    if (!connector || !connector.getWeb3()) {
        throw new Error("WalletConnect is not connected");
    }

    const web3 = connector.getWeb3();
    const accounts = connector.getAccounts();

    if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found in WalletConnect");
    }

    const web3Contract = new web3.eth.Contract(abi, "0x00000000000000000000000000000000000000FC");

    let amount;
    let result;
    let error;

    const gas = 100000;
    const gasPrice = Math.max(new BN(await web3.eth.getGasPrice()).mul(new BN(1)).toNumber(), gasPriceData);

    try {
        const chainId = await web3.eth.getChainId();
        if (!isNetworkEqual(networkConfig, chainId)) {
            throw new Error(`You are currently not on the ${networkConfig.title} network in your wallet. 
                Please choose ${networkConfig.title} to continue.`);
        }

        switch (type) {
            case "MsgSend": {
                amount = Unit.Szabo(amountData || 0).toHex();
                result = await web3.eth
                    .sendTransaction({
                        from: accounts[0],
                        to: new HarmonyAddress(toAddress).checksum,
                        value: Unit.Szabo(amounts[0].amount).toWei(),
                        gasPrice,
                        gas,
                    })
                    .on('error', console.error)
                    .on('transactionHash', transactionHash => {
                        console.log(`Transaction is sending: ${transactionHash}`);
                    });
                break
            }
            case "MsgDelegate": {
                amount = Unit.Szabo(amountData || 0).toHex();
                result = await web3Contract.methods.Delegate(accounts[0], new HarmonyAddress(validatorAddress).checksum, amount).send({
                    from: accounts[0],
                    gasPrice,
                    gas,
                });
                break
            }
            case "MsgUndelegate": {
                amount = Unit.Szabo(amountData || 0).toHex();
                result = await web3Contract.methods.Undelegate(accounts[0], new HarmonyAddress(validatorAddress).checksum, amount).send({
                    from: accounts[0],
                    gasPrice,
                    gas,
                });
                break
            }
            case "MsgWithdrawDelegationReward": {
                result = await web3Contract.methods.CollectRewards(accounts[0]).send({
                    from: accounts[0],
                    gasPrice,
                    gas,
                });
                break
            }
            default:
                break
        }
    } catch (e) {
        error = e;
    }

    return {
        included: async () => {
            if(!error && result && result.status === true) {
                return {txhash: result.transactionHash}
            } else {
                return {
                    error: true,
                    txhash: '',
                    message: error && error.message,
                }
            }
        }
    }
}

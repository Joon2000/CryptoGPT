import {
  fetchBalance,
  fetchBlockNumber,
  fetchEnsAddress,
  fetchEnsName,
  fetchEnsResolver,
  fetchFeeData,
  fetchTransaction,
  fetchToken,
  getAccount,
  getContract,
  getNetwork,
  getPublicClient,
  getWalletClient,
  getWebSocketPublicClient,
} from "@wagmi/core";
import { Abi, Hex } from "viem";
import { Address } from "wagmi";

export const fetchBalanceData = async (address: Address) => {
  const balance = await fetchBalance({ address: address });
  return balance;
};

// export const fetchBlockData = async () => {
//   const blockNumber = await fetchBlockNumber();
//   return blockNumber;
// };

// export const fetchEnsAddressData = async (name: string) => {
//   const ensAddress = await fetchEnsAddress({ name });
//   return ensAddress;
// };

// export const fetchEnsNameData = async (address: Address) => {
//   const ensName = await fetchEnsName({ address });
//   return ensName;
// };

// export const fetchEnsResolverData = async (name: string) => {
//   const resolver = await fetchEnsResolver({ name });
//   return resolver;
// };

// export const fetchFee = async () => {
//   const feeData = await fetchFeeData();
//   return feeData;
// };

// export const fetchTransactionData = async (hash: Hex) => {
//   const transaction = await fetchTransaction({ hash });
//   return transaction;
// };

// export const fetchTokenData = async (address: Address) => {
//   const token = await fetchToken({
//     address,
//   });
//   return token;
// };

export const getAccountData = () => {
  const account = getAccount();
  return account;
};

// export const getContractData = (address: Address, abi: Abi) => {
//   const contract = getContract({
//     address,
//     abi,
//   });
//   return contract;
// };

export const getNetworkData = () => {
  const network = getNetwork();
  return network;
};

// export const getPublicClientData = () => {
//   const publicClient = getPublicClient();
//   return publicClient;
// };

// export const getWalletClientData = async () => {
//   const walletClient = await getWalletClient();
//   return walletClient;
// };

// export const getWebSocketPublicClientData = () => {
//   const webSocketPublicClient = getWebSocketPublicClient();
//   return webSocketPublicClient;
// };

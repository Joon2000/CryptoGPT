import { Address, FetchBalanceResult, GetNetworkResult } from "@wagmi/core";
import { fetchBalanceData, getNetworkData } from "../utils/wagmiFunction";

export const getData = async (address: Address | undefined) => {
  try {
    const balance = await fetchBalanceData(address!);
    const formattedBalance = balance.formatted;
    const network = getNetworkData();
    const walletData = {
      address: address,
      balance: formattedBalance,
      network: network,
    };
    console.log(walletData);
    return walletData;
  } catch (err) {}
};

import { fetchBalanceData, getNetworkData } from "./../utils/wagmiFunction";
import { useAccount } from "wagmi";

export const getData = () => {
  const account = useAccount({
    async onConnect() {
      const balance = await fetchBalanceData(account.address!);
      const network = getNetworkData();
      const walletData = {
        walletUserData: {
          address: account.address,
          balance: balance,
          network: network,
        },
      };
    },
  });
};

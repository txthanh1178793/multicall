import { ethers } from "ethers";

import multicallAbi from "./abi/multicall.json";
import { IERC20__factory } from "./interfaces/erc20";

export interface Call {
  address: string;
  name: string;
  params?: any[];
}

export const multicall = async <T = any>(
  abi: any,
  calls: Call[],
  provider: any
): Promise<T> => {
  try {
    let itf: any;
    const multi = new ethers.Contract(
      "0x956BBC80253755A48FBcCC6783BBB418C793A257", // contract multicall
      multicallAbi,
      provider
    );

    if (abi.encodeFunctionData) {
      itf = abi;
    } else {
      itf = new ethers.utils.Interface(abi);
    }

    const calldata = calls.map((call) => [
      call.address.toLowerCase(),
      itf.encodeFunctionData(call.name, call.params),
    ]);
    const { returnData } = await multi.aggregate(calldata);

    const res = returnData.map((call: any, i: number) =>
      itf.decodeFunctionResult(calls[i].name, call)
    );

    return res;
  } catch (error: any) {
    throw new Error(error);
  }
};

async function main() {
  const account1 = "0x3DA62816dD31c56D9CdF22C6771ddb892cB5b0Cc"; // holder 1
  const account2 = "0xE2C07d20AF0Fb50CAE6cDD615CA44AbaAA31F9c8"; // holder 2

  const accounts = [account1, account2];

  const tokenAddress = "0xad6742a35fb341a9cc6ad674738dd8da98b94fb1"; // token $WOM
  const calls: Call[] = [
    {
      address: tokenAddress,
      name: "balanceOf",
      params: [accounts[0]],
    },
    { name: "balanceOf", address: tokenAddress, params: [accounts[1]] },
  ];

  const provider = new ethers.providers.JsonRpcProvider(
    "https://bsc-dataseed.binance.org"
  );
  const balances = await multicall(IERC20__factory.abi, calls, provider);
  const _data = balances.map((tk: any) => ({
    balance: tk[0] / 10,
  }));

  console.log(_data, "_data");
  return _data;
}

main()
  .then(() => (process.exitCode = 0))
  .catch((error) => {
    console.log(error.message);
    process.exitCode = 1;
  });

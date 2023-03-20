import { ethers } from "ethers";

import multicallAbi from "./abi/multicall.json";
import poolAbi from "./abi/pool.json"
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
      "0x63842f90D8f1BcCAe36eb67C91270e1Df09613a8", // contract multicall
      multicallAbi,
      provider
    );

    // if (abi.encodeFunctionData) {
    //   itf = abi;
    // } else {
    itf = new ethers.utils.Interface(abi);
    // }

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
  const account1 = "0xe924D3860C3EADb4C11Eb52A3D8D5798E13C080e"; // holder 1
  const account2 = "0xE2C07d20AF0Fb50CAE6cDD615CA44AbaAA31F9c8"; // holder 2

  const poolAddress1 = "0x359F4ed0764F878a5BF71A615686fc277cD610C6";
  const poolAddress2 = "0x264bB08fb82ee8f3C996370369E2b63b143d264F";
  const poolAddress3 = "0xf60B965989d4FfE0cE929a66c2048013118a9eA7";
  const poolAddress4 = "0xA2E7882f88a05e4eA7B19a43cDdb2CfdB414d180";


  const accounts = [account1, account2];

  const tokenAddress = "0x614EA1546f54192c713d2fcC516E4a74cF282fA0"; // token $WOM
  const calls: Call[] = [
    // {      
    //   address: tokenAddress,
    //   name: "balanceOf",
    //   params: [accounts[0]],
    // },
    // { name: "balanceOf", address: tokenAddress, params: [accounts[1]] },
    // { name: "totalStaked", address: poolAddress1, params: [] },
    // { name: "totalStakedByAccount", address: poolAddress1, params: [account1] },
    { name: "totalReward", address: poolAddress1, params: [account1] },
    // { name: "amountClaimable", address: poolAddress1, params: [account1] },

    // { name: "totalStaked", address: poolAddress2, params: [] },
    // { name: "totalStakedByAccount", address: poolAddress2, params: [account1] },
    // { name: "totalReward", address: poolAddress2, params: [account1] },
    // { name: "amountClaimable", address: poolAddress2, params: [account1] },

    // { name: "totalStaked", address: poolAddress4, params: [] },
    // { name: "totalStakedByAccount", address: poolAddress4, params: [account1] },
    // { name: "totalReward", address: poolAddress4, params: [account1] },
    // { name: "amountClaimable", address: poolAddress4, params: [account1] },
  ];

  const provider = new ethers.providers.JsonRpcProvider(
    "https://rpc.coinex.net"
  );

  const balances = await multicall(poolAbi, calls, provider);
  const _data = balances.map((tk: any) => ({
    balance: tk[0],
  }));

  console.log(_data);
  return _data;
}

main()
  .then(() => (process.exitCode = 0))
  .catch((error) => {
    console.log(error.message);
    process.exitCode = 1;
  });

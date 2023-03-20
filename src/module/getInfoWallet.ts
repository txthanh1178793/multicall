import { Provider } from "@ethersproject/providers";
import { BigNumber, Signer } from "ethers";
import { contract } from "../configs/contract";
import Multicall from "./multicall";

export async function getInfoWallet(signers: Signer[], provider: Provider, chainId: "56" | "97") {
    const multicall = new Multicall(contract[chainId].multicall, provider);
    const calls = await Promise.all(
        signers.map(async (signer, i) => {
            return {
                name: "getEthBalance",
                address: multicall.multiCallContract.address,
                params: [await signer.getAddress()],
            };
        })
    );
    const balances = await multicall.calls(calls, multicall.multiCallContract.interface);

    return balances.flat().map((bl: BigNumber, i: number) => {
        return {
            address: calls[i].params[0],
            balance: +bl / 1e18,
        };
    });
}

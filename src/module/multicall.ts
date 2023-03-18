import {ethers} from "ethers";
import multicallAbi from "../abi/multicall.json";

interface Call {
    name: string;
    address: string;
    params: any[];
}

class Multicall {
    public multiCallContract: any;

    constructor(multicallAddress: string, provider: ethers.providers.Provider) {
        this.multiCallContract = new ethers.Contract(multicallAddress, multicallAbi, provider);
    }

    calls = async <T = any>(calls: any[], abi: any): Promise<T> => {

        try {
            let itf: any;
            if (abi.encodeFunctionData) {
                itf = abi;
            } else {
                itf = new ethers.utils.Interface(abi);
            }
            const calldata = calls.map((call) => [
                call.address.toLowerCase(),
                itf.encodeFunctionData(call.name, call.params),
            ]);
            const {returnData} = await this.multiCallContract.aggregate(calldata);
            return returnData.map((call: any, i: number) => itf.decodeFunctionResult(calls[i].name, call));
        } catch (error: any) {
            throw new Error(error);
        }
    };
}

export default Multicall;

import clsx from "clsx";
import { useEffect, useState } from "react";
import ActionButton from "@components/commons/ActionButton";
import { TransferData } from "types";
import { useContractContext } from "@contexts/ContractContext";
import axios from "axios";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { ethers, utils } from "ethers";
import Logging from "@api/logging";

export default function StepLastClaim({
  data,
  goToNextStep,
}: {
  data: TransferData;
  goToNextStep: () => void;
}) {
  const [claim, setClaim] = useState<{ nonce: any; signature: string }>();

  const { BridgeV1, Erc20Tokens } = useContractContext();
  const tokenAddress = Erc20Tokens[data.to.tokenName].address;

  // Prepare write contract for `claimFund` function
  const { config: bridgeConfig } = usePrepareContractWrite({
    address: "0x93fE70235854e7c97A5db5ddfC6eAAb078e99d3C", // BridgeV1.address,
    abi: BridgeV1.abi,
    functionName: "claimFund",
    args: [
      "0xA0D0927C9F89CD696bCF30F4BB0E3A1Fa463265d",
      utils.parseEther(data.to.amount.toString()),
      claim?.nonce,
      ethers.constants.MaxUint256,
      tokenAddress,
      claim?.signature,
    ],
  });
  const {
    data: contractData,
    write,
    isLoading,
    isSuccess,
  } = useContractWrite(bridgeConfig);
  console.log({ write });

  useEffect(() => {
    if (claim) {
      write?.();
    }
  }, [claim]);

  const handleOnClaim = async () => {
    try {
      const resp = await axios.post("http://localhost:5741/app/sign-claim", {
        receiverAddress: data.to.address,
        tokenAddress,
        amount: data.to.amount.toString(),
      });
      const claim = resp.data;
      setClaim(claim);
      goToNextStep();
    } catch (e) {
      Logging.error(e);
    }
  };

  return (
    <div className={clsx("pt-4 px-6", "md:px-[73px] md:pt-4 md:pb-6")}>
      <span className="font-semibold block text-center text-dark-900 tracking-[0.01em] md:tracking-wider text-2xl">
        Ready for claiming
      </span>
      <span className="block text-center text-sm text-dark-900 mt-3 pb-6">
        Your transaction has been verified and is now ready to be transferred to
        destination chain (ERC-20). You will be redirected to your wallet to
        claim your tokens.
      </span>
      <ActionButton label="Claim tokens" onClick={() => handleOnClaim()} />
    </div>
  );
}

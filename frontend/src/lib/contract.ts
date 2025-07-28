import { ethers } from "ethers";
import SimpleNFTArtifact from "../../../artifacts/contracts/SimpleNFT.sol/SimpleNFT.json";

// TODO: Replace with your deployed contract address
export const CONTRACT_ADDRESS = "0x4731f79b49f1B4BE48676018b72358c03B277Ac8";
export const CONTRACT_ABI = SimpleNFTArtifact.abi;

export function getNFTContract(providerOrSigner: ethers.Provider | ethers.Signer) {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, providerOrSigner);
} 
import { ethers } from "ethers";
import SimpleNFTArtifact from "../../../artifacts/contracts/SimpleNFT.sol/SimpleNFT.json";

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || "";
export const CONTRACT_ABI = SimpleNFTArtifact.abi;

export function getNFTContract(providerOrSigner: ethers.Provider | ethers.Signer) {
  if (!CONTRACT_ADDRESS) throw new Error("NFT contract address not set in NEXT_PUBLIC_NFT_CONTRACT_ADDRESS");
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, providerOrSigner);
} 
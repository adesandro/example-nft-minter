import { ethers } from "ethers";

// TODO: Replace with your deployed contract address
export const CONTRACT_ADDRESS = "0xYourContractAddress";
// TODO: Replace with your contract ABI
export const CONTRACT_ABI = [
  // ... ABI goes here ...
];

export function getNFTContract(providerOrSigner: ethers.Provider | ethers.Signer) {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, providerOrSigner);
} 
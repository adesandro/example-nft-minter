"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { getNFTContract } from "../lib/contract";

// Add this type declaration at the top for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function HomePage() {
  const [address, setAddress] = useState("");
  const router = useRouter();

  // Mint NFT form state
  const [recipient, setRecipient] = useState("");
  const [status, setStatus] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (address) router.push(`/nfts/${address}`);
  }

  async function handleMint(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Waiting for wallet...");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getNFTContract(signer);
      const sender = await signer.getAddress();
      const to = recipient || sender;
      setStatus("Minting...");
      const tx = await contract.safeMint(to);
      await tx.wait();
      setStatus(`Minted successfully!\nRecipient: ${to}\nSender: ${sender}`);
      setRecipient("");
    } catch (err: any) {
      setStatus("Error: " + (err.message || err));
    }
  }

  return (
    <main className="p-8 min-h-screen bg-gray-50 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8">NFT Viewer</h1>
      <form onSubmit={handleSubmit} className="mb-12 flex gap-2">
        <input
          type="text"
          placeholder="Enter wallet address"
          value={address}
          onChange={e => setAddress(e.target.value)}
          className="border p-2 rounded w-80"
        />
        <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700">
          View NFTs
        </button>
      </form>

      {/* Mint NFT Form */}
      <form onSubmit={handleMint} className="max-w-md w-full p-6 bg-white rounded-xl shadow-md flex flex-col gap-4">
        <h2 className="text-xl font-bold mb-2 text-center">Mint a New NFT</h2>
        <input className="border p-2 rounded" placeholder="Recipient address (leave blank for your wallet)" value={recipient} onChange={e => setRecipient(e.target.value)} />
        <button type="submit" className="bg-green-600 text-white rounded p-2 font-semibold hover:bg-green-700">Mint NFT</button>
        {status && <div className="text-center mt-2">{status}</div>}
      </form>
    </main>
  );
} 
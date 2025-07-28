"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [address, setAddress] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (address) router.push(`/nfts/${address}`);
  }

  return (
    <main style={{ padding: 32 }}>
      <h1>NFT Viewer</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter wallet address"
          value={address}
          onChange={e => setAddress(e.target.value)}
          style={{ width: 320, padding: 8 }}
        />
        <button type="submit" style={{ marginLeft: 8, padding: 8 }}>
          View NFTs
        </button>
      </form>
    </main>
  );
} 
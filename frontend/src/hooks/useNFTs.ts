import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getNFTContract } from "../lib/contract";

export function useNFTs(address: string) {
  const [tokenIds, setTokenIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address || !ethers.isAddress(address)) {
      setTokenIds([]);
      return;
    }
    let cancelled = false;
    async function fetchNFTs() {
      setLoading(true);
      setError(null);
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = getNFTContract(await provider);
        const balance = await contract.balanceOf(address);
        const ids: number[] = [];
        for (let i = 0; i < balance; i++) {
          const tokenId = await contract.tokenOfOwnerByIndex(address, i);
          ids.push(Number(tokenId));
        }
        if (!cancelled) setTokenIds(ids);
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchNFTs();
    return () => { cancelled = true; };
  }, [address]);

  return { tokenIds, loading, error };
} 
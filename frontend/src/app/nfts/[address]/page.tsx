"use client";
import { useNFTs } from "../../../hooks/useNFTs";

export default function NFTsPage({ params }: { params: { address: string } }) {
  const { address } = params;
  const { tokenIds, loading, error } = useNFTs(address);

  return (
    <main className="p-8 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-6 text-center">NFTs for {address}</h1>
      {loading && <p className="text-center">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      {tokenIds.length === 0 && !loading && <p className="text-center text-gray-500">No NFTs found.</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {tokenIds.map(id => (
          <div key={id} className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
            {/* TODO: Fetch and display tokenURI metadata (image, name, etc.) here */}
            <div className="w-40 h-40 bg-gray-200 rounded mb-4 flex items-center justify-center">
              <span className="text-gray-400">Image</span>
            </div>
            <div className="font-semibold text-lg mb-2">Token ID: {id}</div>
            {/* <div className="text-gray-500">Name: ...</div> */}
          </div>
        ))}
      </div>
    </main>
  );
} 
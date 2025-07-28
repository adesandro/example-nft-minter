import { useNFTs } from "../../../hooks/useNFTs";

export default function NFTsPage({ params }: { params: { address: string } }) {
  const { address } = params;
  const { tokenIds, loading, error } = useNFTs(address);

  return (
    <main style={{ padding: 32 }}>
      <h1>NFTs for {address}</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {tokenIds.length === 0 && !loading && <p>No NFTs found.</p>}
      <ul>
        {tokenIds.map(id => (
          <li key={id} style={{ marginBottom: 16 }}>
            <div>Token ID: {id}</div>
            {/* Optionally fetch and display tokenURI metadata here */}
          </li>
        ))}
      </ul>
    </main>
  );
} 
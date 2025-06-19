import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NFTGallery.css';

interface NFT {
  name: string;
  image_path: string;
}

const NFTGallery: React.FC = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchAllNFTs = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/fetch-nfts');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: NFT[] = await response.json();
      setNfts(data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching NFTs:", err);
      setError("Failed to load NFTs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const searchNFTs = async (query: string) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/search-nfts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, top_k: 12 }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: NFT[] = await response.json();
      setNfts(data);
      setError(null);
    } catch (err: any) {
      console.error("Search error:", err);
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllNFTs();
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim() === '') {
      fetchAllNFTs();
    } else {
      searchNFTs(searchQuery);
    }
  };

  const handleNFTClick = (nft: NFT) => {
    navigate(`/nft/${encodeURIComponent(nft.name)}?img=${encodeURIComponent(nft.image_path)}`);
  };

  return (
    <div className="nft-gallery-container">
      <h2>Explore Our NFTs</h2>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search NFTs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {error && <p className="error-message">{error}</p>}
      {loading && <p className="loading-message">Loading...</p>}

      <div className="nft-grid">
        {nfts.map((nft) => (
          <div
            key={nft.name}
            className="nft-item"
            onClick={() => handleNFTClick(nft)}
            style={{ cursor: 'pointer' }}
          >
            <h3>{nft.name}</h3>
            <img
              src={`/${nft.image_path}`}
              alt={nft.name}
              className="nft-image"
              onError={() => console.error(`Failed to load image: /${nft.image_path}`)}
            />
          </div>
        ))}
        {nfts.length === 0 && !loading && !error && <p>No NFTs found.</p>}
      </div>
    </div>
  );
};

export default NFTGallery;

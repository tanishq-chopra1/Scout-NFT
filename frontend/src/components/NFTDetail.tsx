import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import './NFTDetail.css';

interface NFT {
  name: string;
  image_path: string;
}

const NFTDetail: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const imagePath = queryParams.get('img') || '';

  const [similarNFTs, setSimilarNFTs] = useState<NFT[]>([]);
  const [error, setError] = useState<string | null>(null);

  const getImageName = (path: string) => {
    const parts = path.split('/');
    const fileName = parts[parts.length - 1];
    return fileName.replace(/\.[^/.]+$/, '');
  };

  useEffect(() => {
    const fetchSimilarNFTs = async () => {
      try {
        const response = await fetch('http://localhost:8000/search-nfts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: imagePath, top_k: 10 }),
        });
        if (!response.ok) throw new Error('Error fetching similar NFTs');
        const data: NFT[] = await response.json();
        setSimilarNFTs(data);
      } catch (err) {
        setError('Failed to fetch similar NFTs');
        console.error(err);
      }
    };

    fetchSimilarNFTs();
  }, [imagePath]);

  return (
    <div className="nft-detail-container">
      <div className="nft-detail-main">
        <img src={`/${imagePath}`} alt={name} className="nft-detail-image" />
        <h2 className="nft-title">{name}</h2>
        <p className="nft-path"><strong>NFT Name:</strong> {getImageName(imagePath)}</p>
        <button className="back-button" onClick={() => navigate(-1)}>← Go Back</button>
      </div>

      <div className="nft-detail-similar">
        <h3 className="similar-title">Similar NFTs</h3>
        {error && <p className="error">{error}</p>}
        <div className="similar-nfts-scroll">
          {similarNFTs.map((nft) => (
            <Link
              key={nft.name}
              to={`/nft/${encodeURIComponent(nft.name)}?img=${encodeURIComponent(nft.image_path)}`}
              className="similar-nft-link"
            >
              <div className="similar-nft-item">
                <img src={`/${nft.image_path}`} alt={nft.name} />
                <p>{nft.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NFTDetail;

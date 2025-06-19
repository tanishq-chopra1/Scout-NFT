from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import numpy as np
import torch
import json
from transformers import CLIPProcessor
from sklearn.metrics.pairwise import cosine_similarity
from database import connect_db, fetch_random_nfts, close_db
import os
from model.clipWithMetaData import CLIPWithMetadata
import urllib.parse

device = "mps" if torch.backends.mps.is_available() else "cpu"

metadata_dim = 15445
model = CLIPWithMetadata("openai/clip-vit-base-patch32", metadata_dim)
model.load_state_dict(torch.load("model/clip_with_metadata.pt", map_location="cpu"))
model.eval()
model.to("mps" if torch.backends.mps.is_available() else "cpu")

processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
embeds = np.load("model/nft_embeddings.npy")
with open("model/nft_paths.json") as f:
    paths = json.load(f)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class NFT(BaseModel):
    name: str
    image_path: str

class TextQuery(BaseModel):
    query: str
    top_k: int = 10


@app.get("/fetch-nfts", response_model=List[NFT])
async def fetch_nfts():
    """Fetches 200 random name and image_path from the nfts table."""
    conn = await connect_db()
    if not conn:
        raise HTTPException(status_code=500, detail="Could not connect to database")

    nfts_data = await fetch_random_nfts(conn, limit=500)
    await close_db(conn)

    nfts = [NFT(name=name, image_path=urllib.parse.quote((url))) for name, url in nfts_data]
    return nfts


def fast_mmr(query_embed, candidate_embeds, top_k=10, lambda_param=0.7):
    query_sim = cosine_similarity(query_embed, candidate_embeds)[0]
    candidate_embeds = np.array(candidate_embeds)

    selected = []
    selected_mask = np.zeros(len(candidate_embeds), dtype=bool)

    for _ in range(top_k):
        if not selected:
            idx = np.argmax(query_sim)
        else:
            selected_embeds = candidate_embeds[selected]
            div_sim = cosine_similarity(candidate_embeds, selected_embeds).max(axis=1)
            mmr_scores = lambda_param * query_sim - (1 - lambda_param) * div_sim
            mmr_scores[selected_mask] = -np.inf
            idx = np.argmax(mmr_scores)

        selected.append(idx)
        selected_mask[idx] = True

    return selected

@app.post("/search-nfts", response_model=List[NFT])
async def search_nfts(text_query: TextQuery):
    query = text_query.query
    top_k = text_query.top_k

    enc = processor(text=[query], return_tensors="pt", padding=True, truncation=True)
    enc = {k: v.to(device) for k, v in enc.items()}  # use proper device here

    with torch.no_grad():
        text_out = model.clip.text_model(
            input_ids=enc["input_ids"],
            attention_mask=enc["attention_mask"]
        )
        text_embed = model.clip.text_projection(text_out.pooler_output)
        query_embed = torch.nn.functional.normalize(text_embed, dim=-1).cpu().numpy()

    top_indices = fast_mmr(query_embed, embeds, top_k=top_k, lambda_param=0.7)

    results = []
    for idx in top_indices:
        name = os.path.basename(paths[idx]).split(".")[0]
        image_path = paths[idx].replace(".png", ".jpg")
        image_path =  urllib.parse.quote(image_path.replace("/img/","/"))
        results.append(NFT(name=name, image_path=image_path))

    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from transformers import CLIPProcessor, CLIPModel
from tqdm import tqdm
import torch.nn.functional as F

class MetadataProjector(nn.Module):
    def __init__(self, input_dim, embed_dim):
        super().__init__()
        self.mlp = nn.Sequential(
            nn.Linear(input_dim, embed_dim),
            nn.ReLU(),
            nn.Linear(embed_dim, embed_dim)
        )

    def forward(self, metadata_vec):
        return self.mlp(metadata_vec)
    
class CLIPWithMetadata(nn.Module):
    def __init__(self, model_name, metadata_dim):
        super().__init__()
        self.clip = CLIPModel.from_pretrained(model_name)
        self.projector = MetadataProjector(metadata_dim, self.clip.config.projection_dim)

    def forward(self, pixel_values, input_ids, attention_mask, metadata_vec):
        outputs = self.clip.vision_model(pixel_values=pixel_values)
        image_embeds = self.clip.visual_projection(outputs.pooler_output)

        outputs = self.clip.text_model(input_ids=input_ids, attention_mask=attention_mask)
        text_embeds = self.clip.text_projection(outputs.pooler_output)

        meta_embed = self.projector(metadata_vec)

        # Fuse embeddings with metadata
        image_fused = F.normalize(image_embeds + meta_embed, dim=-1)
        text_fused = F.normalize(text_embeds + meta_embed, dim=-1)

        return image_fused, text_fused
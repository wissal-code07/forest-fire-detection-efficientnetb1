"""
FireGuard — Chargement et inférence du modèle EfficientNet-B1

Ce module charge le modèle UNE SEULE FOIS au démarrage du serveur Django
(pattern Singleton) pour éviter de recharger les poids à chaque requête.

Architecture identique au notebook d'entraînement :
  EfficientNet-B1 pré-entraîné ImageNet
  → Classifier : 1280 → Dropout(0.3) → Linear(256) → ReLU → Dropout(0.2) → Linear(2)
"""

import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import io
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


# ── Singleton : modèle chargé une seule fois ──────────────────────────────────
_model = None
_device = None
_transform = None


def _build_model(config: dict) -> nn.Module:
    """
    Reconstruit l'architecture EfficientNet-B1 identique à celle du notebook.
    """
    # Charger EfficientNet-B1 (architecture seulement, sans poids ImageNet)
    model = models.efficientnet_b1(weights=None)

    # Remplacer le classifier — IDENTIQUE au notebook
    in_features = model.classifier[1].in_features  # = 1280
    model.classifier = nn.Sequential(
        nn.Dropout(p=config['dropout1'], inplace=True),
        nn.Linear(in_features, config['classifier_hidden']),  # 1280 → 256
        nn.ReLU(),
        nn.Dropout(p=config['dropout2']),
        nn.Linear(config['classifier_hidden'], 2),            # 256 → 2
    )
    return model


def _build_transform(config: dict) -> transforms.Compose:
    """
    Preprocessing identique à la phase 'val' du notebook.
    """
    size = config['input_size']
    return transforms.Compose([
        transforms.Resize((size, size)),
        transforms.CenterCrop(size),
        transforms.ToTensor(),
        transforms.Normalize(mean=config['mean'], std=config['std']),
    ])


def load_model():
    """
    Charge le modèle en mémoire (appelé une seule fois au démarrage).
    Retourne True si succès, False si le fichier .pth est absent.
    """
    global _model, _device, _transform

    if _model is not None:
        return True  # Déjà chargé

    config = settings.MODEL_CONFIG
    model_path = settings.MODEL_PATH

    _device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    logger.info(f'FireGuard — Device : {_device}')

    try:
        # 1. Construire l'architecture
        model = _build_model(config)

        # 2. Charger les poids entraînés
        state_dict = torch.load(model_path, map_location=_device)
        model.load_state_dict(state_dict)

        # 3. Mode inférence (désactive Dropout et BatchNorm en mode train)
        model.eval()
        model.to(_device)

        _model = model
        _transform = _build_transform(config)

        logger.info(f'FireGuard — Modèle chargé depuis : {model_path}')
        logger.info(f'FireGuard — Seuil optimal : {config["threshold"]}')
        return True

    except FileNotFoundError:
        logger.error(
            f'FireGuard — Fichier modèle introuvable : {model_path}\n'
            f'  → Placez efficientnet_b1_deepfire.pth dans ml_models/'
        )
        return False

    except Exception as e:
        logger.error(f'FireGuard — Erreur chargement modèle : {e}')
        return False


def is_model_loaded() -> bool:
    return _model is not None


def predict(image_bytes: bytes) -> dict:
    """
    Effectue une prédiction sur une image.

    Args:
        image_bytes: contenu binaire de l'image (JPG, PNG, etc.)

    Returns:
        dict avec les clés :
          - label        : 'fire' ou 'nofire'
          - label_fr     : 'Incendie' ou 'Pas d'incendie'
          - confidence   : float entre 0 et 1 (confiance dans la classe prédite)
          - prob_fire    : float probabilité de feu
          - prob_nofire  : float probabilité pas de feu
          - threshold    : seuil utilisé
          - alert        : bool — True si feu détecté
    """
    if _model is None:
        raise RuntimeError('Modèle non chargé. Appelez load_model() d\'abord.')

    config = settings.MODEL_CONFIG
    threshold = config['threshold']

    # ── 1. Ouvrir et préprocesser l'image ─────────────────────────────────────
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    tensor = _transform(image).unsqueeze(0).to(_device)  # [1, 3, 240, 240]

    # ── 2. Inférence (sans calcul de gradients) ───────────────────────────────
    with torch.no_grad():
        logits = _model(tensor)                        # [1, 2]
        probs  = torch.softmax(logits, dim=1)[0]      # [2]

    prob_nofire = probs[0].item()
    prob_fire   = probs[1].item()

    # ── 3. Décision avec seuil optimal (calculé via Youden dans le notebook) ──
    predicted_class = 1 if prob_fire >= threshold else 0
    label    = config['classes'][predicted_class]       # 'fire' ou 'nofire'
    confidence = prob_fire if predicted_class == 1 else prob_nofire

    label_fr_map = {
        'fire':   'Incendie détecté',
        'nofire': 'Pas d\'incendie',
    }

    return {
        'label':      label,
        'label_fr':   label_fr_map[label],
        'confidence': round(confidence, 4),
        'prob_fire':  round(prob_fire, 4),
        'prob_nofire': round(prob_nofire, 4),
        'threshold':  threshold,
        'alert':      predicted_class == 1,
    }
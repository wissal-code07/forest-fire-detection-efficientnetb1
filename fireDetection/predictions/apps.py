from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)


class PredictionsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'predictions'
    verbose_name = 'FireGuard — Prédictions'

    def ready(self):
        """
        Appelé au démarrage de Django.
        On charge le modèle PyTorch une seule fois en mémoire.
        """
        # Eviter le double chargement en mode développement (auto-reload)
        import os
        if os.environ.get('RUN_MAIN') == 'true' or not os.environ.get('RUN_MAIN'):
            from .ml.model_loader import load_model
            success = load_model()
            if success:
                logger.info('✅ FireGuard — Modèle EfficientNet-B1 chargé avec succès !')
            else:
                logger.warning(
                    '⚠️  FireGuard — Modèle non chargé. '
                    'Placez efficientnet_b1_deepfire.pth dans ml_models/ '
                    'et redémarrez le serveur.'
                )
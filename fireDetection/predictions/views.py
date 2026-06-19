"""
FireGuard — Vues API REST

Endpoints :
  POST /api/predict/        → Analyser une image
  GET  /api/history/        → Historique des analyses
  GET  /api/history/<id>/   → Détail d'une analyse
  GET  /api/stats/          → Statistiques pour le dashboard
  GET  /api/health/         → Santé de l'API (modèle chargé ?)
"""

import logging
from django.utils import timezone
from django.db.models import Avg, Count, Q
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Prediction
from .serializers import (
    PredictionSerializer,
    PredictionCreateSerializer,
    StatsSerializer,
)
from .ml.model_loader import predict, is_model_loaded

logger = logging.getLogger(__name__)


class PredictView(APIView):
    """
    POST /api/predict/
    Reçoit une image, effectue la prédiction avec EfficientNet-B1,
    sauvegarde le résultat et retourne la réponse JSON.
    """
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        # ── 1. Vérifier que le modèle est chargé ──────────────────────────────
        if not is_model_loaded():
            return Response(
                {
                    'error': 'Modèle non disponible.',
                    'detail': (
                        'Le fichier efficientnet_b1_deepfire.pth est introuvable. '
                        'Placez-le dans le dossier ml_models/ et redémarrez le serveur.'
                    )
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        # ── 2. Valider les données entrantes ───────────────────────────────────
        serializer = PredictionCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': 'Données invalides.', 'detail': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        image_file = serializer.validated_data['image']

        # ── 3. Effectuer la prédiction ─────────────────────────────────────────
        try:
            image_bytes = image_file.read()
            result = predict(image_bytes)
        except Exception as e:
            logger.error(f'Erreur de prédiction : {e}')
            return Response(
                {'error': 'Erreur lors de l\'analyse de l\'image.', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # ── 4. Sauvegarder en base de données ─────────────────────────────────
        # Remettre le curseur au début pour sauvegarder le fichier
        image_file.seek(0)

        prediction = Prediction.objects.create(
            image         = image_file,
            label         = result['label'],
            confidence    = result['confidence'],
            prob_fire     = result['prob_fire'],
            prob_nofire   = result['prob_nofire'],
            threshold     = result['threshold'],
            alert         = result['alert'],
            wilaya        = serializer.validated_data.get('wilaya', ''),
            location_note = serializer.validated_data.get('location_note', ''),
            notes         = serializer.validated_data.get('notes', ''),
        )

        # ── 5. Retourner la réponse ────────────────────────────────────────────
        out_serializer = PredictionSerializer(prediction, context={'request': request})

        logger.info(
            f'Prédiction #{prediction.id} : {result["label"].upper()} '
            f'(confiance {result["confidence"]:.1%})'
        )

        return Response(out_serializer.data, status=status.HTTP_201_CREATED)


class HistoryView(APIView):
    """
    GET /api/history/?page=1&limit=10&label=fire&wilaya=05
    Liste paginée de l'historique des analyses.
    """

    def get(self, request):
        queryset = Prediction.objects.all()

        # ── Filtres optionnels ─────────────────────────────────────────────────
        label  = request.query_params.get('label')
        wilaya = request.query_params.get('wilaya')
        alert  = request.query_params.get('alert')

        if label in ('fire', 'nofire'):
            queryset = queryset.filter(label=label)
        if wilaya:
            queryset = queryset.filter(wilaya=wilaya)
        if alert is not None:
            queryset = queryset.filter(alert=(alert.lower() == 'true'))

        # ── Pagination simple ──────────────────────────────────────────────────
        try:
            limit = min(int(request.query_params.get('limit', 10)), 100)
            page  = max(int(request.query_params.get('page', 1)), 1)
        except ValueError:
            limit, page = 10, 1

        offset = (page - 1) * limit
        total  = queryset.count()
        items  = queryset[offset : offset + limit]

        serializer = PredictionSerializer(
            items, many=True, context={'request': request}
        )

        return Response({
            'count':    total,
            'page':     page,
            'limit':    limit,
            'pages':    (total + limit - 1) // limit,
            'results':  serializer.data,
        })


class PredictionDetailView(APIView):
    """
    GET /api/history/<id>/
    Détail d'une analyse spécifique.
    """

    def get(self, request, pk):
        try:
            prediction = Prediction.objects.get(pk=pk)
        except Prediction.DoesNotExist:
            return Response(
                {'error': f'Analyse #{pk} introuvable.'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = PredictionSerializer(prediction, context={'request': request})
        return Response(serializer.data)

    def delete(self, request, pk):
        try:
            prediction = Prediction.objects.get(pk=pk)
        except Prediction.DoesNotExist:
            return Response(
                {'error': f'Analyse #{pk} introuvable.'},
                status=status.HTTP_404_NOT_FOUND
            )
        prediction.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class StatsView(APIView):
    """
    GET /api/stats/
    Statistiques globales pour le dashboard React.
    """

    def get(self, request):
        today = timezone.now().date()

        total   = Prediction.objects.count()
        fires   = Prediction.objects.filter(alert=True).count()
        nofires = total - fires

        avg_conf = Prediction.objects.aggregate(avg=Avg('confidence'))['avg'] or 0.0
        last_alert_obj = (
            Prediction.objects.filter(alert=True)
            .order_by('-created_at')
            .first()
        )
        analyses_today = Prediction.objects.filter(
            created_at__date=today
        ).count()

        # Détail par wilaya (pour une future carte)
        by_wilaya = (
            Prediction.objects
            .exclude(wilaya='')
            .values('wilaya')
            .annotate(total=Count('id'), fires=Count('id', filter=Q(alert=True)))
            .order_by('-fires')[:10]
        )

        # Activité des 7 derniers jours
        from datetime import timedelta
        last_7_days = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            count = Prediction.objects.filter(created_at__date=day).count()
            fires_day = Prediction.objects.filter(
                created_at__date=day, alert=True
            ).count()
            last_7_days.append({
                'date':   day.isoformat(),
                'total':  count,
                'fires':  fires_day,
            })

        data = {
            'total_analyses': total,
            'total_fires':    fires,
            'total_nofires':  nofires,
            'fire_rate':      round(fires / total * 100, 1) if total else 0.0,
            'avg_confidence': round(avg_conf * 100, 1),
            'last_alert':     last_alert_obj.created_at if last_alert_obj else None,
            'analyses_today': analyses_today,
            'model_name':     'EfficientNet-B1 (DeepFire)',
            'model_accuracy': 100.0,    # Accuracy obtenue sur le jeu de test
            'by_wilaya':      list(by_wilaya),
            'last_7_days':    last_7_days,
        }

        return Response(data)


class HealthView(APIView):
    """
    GET /api/health/
    Vérifie que l'API fonctionne et que le modèle est chargé.
    """

    def get(self, request):
        import torch
        return Response({
            'status':       'ok' if is_model_loaded() else 'degraded',
            'model_loaded': is_model_loaded(),
            'device':       str(torch.device('cuda' if torch.cuda.is_available() else 'cpu')),
            'framework':    'PyTorch',
            'model':        'EfficientNet-B1',
        })
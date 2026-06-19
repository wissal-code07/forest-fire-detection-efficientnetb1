from rest_framework import serializers
from .models import Prediction


class PredictionSerializer(serializers.ModelSerializer):
    """Sérialiseur pour afficher une prédiction en lecture."""

    confidence_percent = serializers.ReadOnlyField()
    wilaya_name        = serializers.ReadOnlyField()
    image_url          = serializers.SerializerMethodField()

    class Meta:
        model = Prediction
        fields = [
            'id',
            'image_url',
            'label',
            'confidence',
            'confidence_percent',
            'prob_fire',
            'prob_nofire',
            'threshold',
            'alert',
            'wilaya',
            'wilaya_name',
            'location_note',
            'notes',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Ajouter label_fr dynamiquement (n'est pas un champ du modèle)
        data['label_fr'] = 'Incendie détecté' if instance.alert else "Pas d'incendie"
        return data


class PredictionCreateSerializer(serializers.Serializer):
    """Sérialiseur pour l'upload d'une image à analyser."""

    image         = serializers.ImageField(required=True)
    wilaya        = serializers.CharField(max_length=2, required=False, default='')
    location_note = serializers.CharField(max_length=200, required=False, default='')
    notes         = serializers.CharField(required=False, default='')

    def validate_image(self, value):
        # Vérifier la taille (max 10 MB)
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError(
                "L'image ne doit pas dépasser 10 MB."
            )
        # Vérifier le type MIME
        allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp']
        if hasattr(value, 'content_type') and value.content_type not in allowed_types:
            raise serializers.ValidationError(
                "Format non supporté. Utilisez JPG, PNG, WebP ou BMP."
            )
        return value


class StatsSerializer(serializers.Serializer):
    """Statistiques globales pour le dashboard."""

    total_analyses  = serializers.IntegerField()
    total_fires     = serializers.IntegerField()
    total_nofires   = serializers.IntegerField()
    fire_rate       = serializers.FloatField()
    avg_confidence  = serializers.FloatField()
    last_alert      = serializers.DateTimeField(allow_null=True)
    analyses_today  = serializers.IntegerField()
    model_name      = serializers.CharField()
    model_accuracy  = serializers.FloatField()
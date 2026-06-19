from django.contrib import admin
from django.utils.html import format_html
from .models import Prediction


@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display  = ['id', 'thumbnail', 'status_badge', 'confidence_display',
                     'wilaya_name', 'created_at']
    list_filter   = ['alert', 'label', 'wilaya', 'created_at']
    search_fields = ['location_note', 'notes', 'wilaya']
    readonly_fields = ['thumbnail_large', 'label', 'confidence', 'prob_fire',
                       'prob_nofire', 'threshold', 'alert', 'created_at']
    ordering      = ['-created_at']

    fieldsets = (
        ('Résultat de l\'analyse', {
            'fields': ('thumbnail_large', 'label', 'alert', 'confidence',
                       'prob_fire', 'prob_nofire', 'threshold')
        }),
        ('Localisation', {
            'fields': ('wilaya', 'location_note')
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
        ('Métadonnées', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )

    def thumbnail(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width:60px;height:40px;object-fit:cover;border-radius:4px;">',
                obj.image.url
            )
        return '—'
    thumbnail.short_description = 'Image'

    def thumbnail_large(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-width:400px;border-radius:8px;">',
                obj.image.url
            )
        return '—'
    thumbnail_large.short_description = 'Aperçu'

    def status_badge(self, obj):
        if obj.alert:
            return format_html(
                '<span style="background:#dc2626;color:white;padding:2px 8px;'
                'border-radius:12px;font-weight:bold;">🔥 INCENDIE</span>'
            )
        return format_html(
            '<span style="background:#16a34a;color:white;padding:2px 8px;'
            'border-radius:12px;">🌲 OK</span>'
        )
    status_badge.short_description = 'Statut'

    def confidence_display(self, obj):
        pct = obj.confidence_percent
        color = '#dc2626' if obj.alert else '#16a34a'
        return format_html(
            '<span style="color:{};font-weight:bold;">{:.1f}%</span>',
            color, pct
        )
    confidence_display.short_description = 'Confiance'
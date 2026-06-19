from django.urls import path
from . import views

urlpatterns = [
    # Prédiction (POST image → résultat)
    path('predict/',          views.PredictView.as_view(),         name='predict'),

    # Historique
    path('history/',          views.HistoryView.as_view(),         name='history'),
    path('history/<int:pk>/', views.PredictionDetailView.as_view(), name='prediction-detail'),

    # Dashboard
    path('stats/',            views.StatsView.as_view(),           name='stats'),

    # Santé de l'API
    path('health/',           views.HealthView.as_view(),          name='health'),
]
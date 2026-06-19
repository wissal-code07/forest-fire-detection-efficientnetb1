from django.db import models


class Prediction(models.Model):
    """
    Enregistrement d'une analyse d'image dans la base de données.
    """

    LABEL_CHOICES = [
        ('fire',   'Incendie'),
        ('nofire', 'Pas d\'incendie'),
    ]

    WILAYA_CHOICES = [
        ('', 'Wilaya non précisée'),
        ('01', 'Adrar'), ('02', 'Chlef'), ('03', 'Laghouat'), ('04', 'Oum El Bouaghi'),
        ('05', 'Batna'), ('06', 'Béjaïa'), ('07', 'Biskra'), ('08', 'Béchar'),
        ('09', 'Blida'), ('10', 'Bouira'), ('11', 'Tamanrasset'), ('12', 'Tébessa'),
        ('13', 'Tlemcen'), ('14', 'Tiaret'), ('15', 'Tizi Ouzou'), ('16', 'Alger'),
        ('17', 'Djelfa'), ('18', 'Jijel'), ('19', 'Sétif'), ('20', 'Saïda'),
        ('21', 'Skikda'), ('22', 'Sidi Bel Abbès'), ('23', 'Annaba'), ('24', 'Guelma'),
        ('25', 'Constantine'), ('26', 'Médéa'), ('27', 'Mostaganem'), ('28', 'M\'Sila'),
        ('29', 'Mascara'), ('30', 'Ouargla'), ('31', 'Oran'), ('32', 'El Bayadh'),
        ('33', 'Illizi'), ('34', 'Bordj Bou Arréridj'), ('35', 'Boumerdès'),
        ('36', 'El Tarf'), ('37', 'Tindouf'), ('38', 'Tissemsilt'), ('39', 'El Oued'),
        ('40', 'Khenchela'), ('41', 'Souk Ahras'), ('42', 'Tipaza'), ('43', 'Mila'),
        ('44', 'Aïn Defla'), ('45', 'Naâma'), ('46', 'Aïn Témouchent'),
        ('47', 'Ghardaïa'), ('48', 'Relizane'), ('49', 'Timimoun'),
        ('50', 'Bordj Badji Mokhtar'), ('51', 'Ouled Djellal'), ('52', 'Béni Abbès'),
        ('53', 'In Salah'), ('54', 'In Guezzam'), ('55', 'Touggourt'),
        ('56', 'Djanet'), ('57', 'El M\'Ghair'), ('58', 'El Meniaa'),
    ]

    # ── Champs principaux ──────────────────────────────────────────────────────
    image         = models.ImageField(upload_to='predictions/%Y/%m/%d/')
    label         = models.CharField(max_length=10, choices=LABEL_CHOICES)
    confidence    = models.FloatField()
    prob_fire     = models.FloatField()
    prob_nofire   = models.FloatField()
    threshold     = models.FloatField(default=0.5653)
    alert         = models.BooleanField(default=False)

    # ── Métadonnées optionnelles ────────────────────────────────────────────────
    wilaya        = models.CharField(max_length=2, choices=WILAYA_CHOICES, blank=True, default='')
    location_note = models.CharField(max_length=200, blank=True, default='')
    notes         = models.TextField(blank=True, default='')

    # ── Horodatage ─────────────────────────────────────────────────────────────
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Prédiction'
        verbose_name_plural = 'Prédictions'

    def __str__(self):
        label_display = 'FEUX 🔥' if self.alert else 'Pas de feu 🌲'
        return f'[{self.created_at:%d/%m/%Y %H:%M}] {label_display} — {self.confidence:.1%}'

    @property
    def confidence_percent(self):
        return round(self.confidence * 100, 1)

    @property
    def wilaya_name(self):
        return dict(self.WILAYA_CHOICES).get(self.wilaya, 'Non précisée')
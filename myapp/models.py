import uuid
from django.db import models

class Order(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    table_number = models.IntegerField()
    items = models.TextField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, default="waiting")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Заказ {self.id} (Стол {self.table_number}): {self.items} — {self.total_price}₽"

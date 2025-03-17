from django.urls import path

from .views import home, page1, page2, add_order, get_revenue

urlpatterns = [
    path('', home, name='home'),
    path('page1/', page1, name='page1'),
    path('page2/', page2, name='page2'),
    path("add_order/", add_order, name="add_order"),
    path('get_revenue/', get_revenue, name='get_revenue'),
]
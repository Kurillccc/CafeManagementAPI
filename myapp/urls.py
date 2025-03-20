from django.urls import path

from .views import home, page1, add_order, page2, get_order, update_order, delete_order, get_revenue

urlpatterns = [
    path('', home, name='home'),
    path('page1/', page1, name='page1'),
    path('add_order/', add_order, name='add_order'),
    path("get_order/", get_order, name="get_order"),
    path("update_order/", update_order, name="update_order"),
    path("delete_order/", delete_order, name="delete_order"),
    path('page2/', page2, name='page2'),
    path('get_revenue/', get_revenue, name='get_revenue'),
]

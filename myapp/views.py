import json

from django.db.models import Sum
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone

from .models import Order


def home(request):
    return render(request, 'home.html')


def page1(request):
    return render(request, 'page1.html')


def page2(request):
    orders = Order.objects.all()
    return render(request, 'page2.html', {'orders': orders})


# Добавление заказа
@csrf_exempt  # Отключаем проверку CSRF для этого представления
def add_order(request):
    if request.method == 'POST':
        try:
            # Декодируем JSON-данные из тела запроса
            data = json.loads(request.body)
            table_number = data.get('table_number')
            items = data.get('items')
            total_price = data.get('total_price')  # Получаем переданную стоимость
            status = data.get('status')

            # Проверяем, что данные присутствуют
            if not table_number or not items:
                return JsonResponse({'message': 'Заполните все поля!'}, status=400)

            # Создаем новый заказ
            order = Order.objects.create(table_number=table_number, items=items, total_price=total_price, status=status)
            print(f"Созданный заказ: {order}")

            # Возвращаем успешный ответ
            return JsonResponse({}, status=200)
        except json.JSONDecodeError:
            return JsonResponse({'message': 'Ошибка при обработке данных'}, status=400)
    else:
        return JsonResponse({'message': 'Неверный запрос'}, status=400)


# поиск заказа и изменение
@csrf_exempt
def get_order(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            search_value = data.get("search_value")  # ID или номер стола
            if search_value.isdigit(): search_value = int(search_value)
            # Поиск по ID или номеру стола
            order = Order.objects.filter(id=search_value).first() or Order.objects.filter(table_number=int(search_value)).first()
            if not order:
                return JsonResponse({"error": "Заказ не найден"}, status=404)

            print(f"Найденный заказ: {order}")

            return JsonResponse({
                "id": order.id,
                "table_number": order.table_number,
                "items": order.items,
                "total_price": order.total_price,
                "status": order.status
            })
        except Exception as e:
            return JsonResponse({"error": "Заказ не найден"}, status=500)


@csrf_exempt
def update_order(request):
    if request.method == "POST":
        data = json.loads(request.body)
        order_id = data.get("id")

        try:
            order = Order.objects.get(id=order_id)
            order.table_number = data.get("table_number", order.table_number)
            order.items = data.get("items", order.items)
            order.total_price = data.get("total_price", order.total_price)
            order.status = data.get("status", order.status)
            order.save()
            return JsonResponse({"message": "Заказ обновлен"})
        except Order.DoesNotExist:
            return JsonResponse({"error": "Заказ не найден"}, status=404)


@csrf_exempt
def delete_order(request):
    if request.method == "POST":
        data = json.loads(request.body)
        order_id = data.get("id")

        try:
            order = Order.objects.get(id=order_id)
            order.delete()
            return JsonResponse({"message": "Заказ удален"})
        except Order.DoesNotExist:
            return JsonResponse({"error": "Заказ не найден"}, status=404)


# статистика за смену и за все время
def get_revenue(request):
    try:
        orders = Order.objects.all()

        # Общее количество заказов
        order_count = orders.count()

        # Общая выручка за все время
        total_revenue = orders.aggregate(total_revenue=Sum('total_price'))['total_revenue'] or 0

        # Выручка за сегодняшний день
        today = timezone.localtime(timezone.now()).date()
        orders_today = orders.filter(created_at__date=today)
        total_revenue_today = orders_today.aggregate(total_revenue=Sum('total_price'))['total_revenue'] or 0

        return JsonResponse({
            'order_count': order_count,
            'total_revenue': total_revenue,
            'total_revenue_today': total_revenue_today
        })

    except Exception as e:
        return JsonResponse({'message': f'Ошибка: {str(e)}'}, status=500)

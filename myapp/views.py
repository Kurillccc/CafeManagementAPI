import json

from django.db.models import Sum
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

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


@csrf_exempt
def get_order(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            search_value = data.get("search_value")  # ID или номер стола
            # Поиск по ID или номеру стола
            order = Order.objects.filter(id=search_value).first() or Order.objects.filter(table_number=search_value).first()
            print(f"Найденный заказ: {order}")
            if not order:
                return JsonResponse({"error": "Заказ не найден"}, status=404)

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


def get_revenue(request):
    try:
        orders = Order.objects.all()

        order_count = orders.count()

        total_revenue = orders.aggregate(total_revenue=Sum('total_price'))['total_revenue'] or 0

        return JsonResponse({
            'order_count': order_count,
            'total_revenue': total_revenue
        })

    except Exception as e:
        return JsonResponse({'message': f'Ошибка: {str(e)}'}, status=500)

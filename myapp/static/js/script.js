// Обработчик кнопок
document.getElementById("add-btn").addEventListener("click", function() {
    document.getElementById("search-container").style.display = "none";
    document.getElementById("search-fields").style.display = "none";
    document.getElementById("revenue-container").style.display = "none";
    document.getElementById("input-container").style.display = "flex";
});

document.getElementById("search-btn").addEventListener("click", function() {
    document.getElementById("input-container").style.display = "none";
    document.getElementById("success-message").style.display = "none";
    document.getElementById("revenue-container").style.display = "none";
    document.getElementById("search-container").style.display = "flex";
});

document.getElementById("orders-btn").addEventListener("click", function() {
    window.open("/page2/", "_blank");
});

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("revenue-btn").addEventListener("click", function() {
        document.getElementById("input-container").style.display = "none";
        document.getElementById("search-container").style.display = "none";
        document.getElementById("search-fields").style.display = "none";
        document.getElementById("success-message").style.display = "none";
        document.getElementById("revenue-container").style.display = "flex";

        // Отправка запроса на сервер для получения статистики
        fetch("http://127.0.0.1:8000/get_revenue/", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Ошибка при получении данных");
            }
            return response.json();
        })
        .then(data => {
            // Проверяем, что сервер вернул все необходимые данные
            const totalRevenueToday = data.total_revenue_today ?? "Нет данных";
            const orderCount = data.order_count ?? "Нет данных";
            const totalRevenue = data.total_revenue ?? "Нет данных";

            // Обновляем текст в элементах
            document.getElementById("total-revenue-today").textContent = totalRevenueToday;
            document.getElementById("total-orders").textContent = orderCount;
            document.getElementById("total-revenue").textContent = totalRevenue;
        })
        .catch(error => console.error("Ошибка:", error));
    });
});

document.addEventListener("DOMContentLoaded", function () {
    // Обработчик для кнопки submit-btn
    document.getElementById("submit-btn").addEventListener("click", function() {
        const tableNumber = document.getElementById("table_number").value;
        const items = document.getElementById("items").value;

        // Проверка, чтобы оба поля были заполнены
        if (!tableNumber || !items) {
            alert("Заполните все поля!");
            return;
        }

        const extractPrice = (str) => {
            // Ищем числа внутри скобок, включая десятичные, если они есть
            const matches = str.match(/\((\d+(\.\d+)?)\)/g);

            if (matches) {
                return matches.reduce((sum, item) => {
                    // Извлекаем число из строки (удаляем ненужные символы) и добавляем к сумме
                    return sum + parseFloat(item.replace(/[^\d.]/g, ''));
                }, 0);
            }
            return 0; // Если нет чисел в скобках, возвращаем 0
        };

        const totalPrice = extractPrice(items);

        // Создаем уникальный ID
        const uniqueId = 'order_' + Date.now(); // Используем метку времени для уникальности

        // Отправка данных в БД через API
        fetch("http://127.0.0.1:8000/add_order/", { // URL API
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: uniqueId,
                table_number: tableNumber,
                items: items,
                total_price: totalPrice,  // Добавляем итоговую цену
                status: "waiting"  // Статус заказа по умолчанию
            })
        })
        .then(response => response.json())
        .then(data => {
            // Очистить поля ввода после отправки
            document.getElementById("table_number").value = "";
            document.getElementById("items").value = "";

            // Отображаем сообщение об успешной отправке
            document.getElementById("success-message").style.display = "block";

            // Скрываем сообщение спустя 3 секунды
            setTimeout(function() {
                document.getElementById("success-message").style.display = "none";
            }, 3000);
        })
        .catch(error => console.error("Ошибка:", error));
    });
});

// Обработчик для кнопки Submit-search
document.getElementById("search-submit-btn").addEventListener("click", function() {
    const searchValue = document.getElementById("search-input").value;

    if (!searchValue) {
        alert("Введите ID заказа или номер стола");
        return;
    }

    fetch("http://127.0.0.1:8000/get_order/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            search_value: searchValue
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            document.getElementById("search-fields").style.display = "none";
            alert(data.error);
            return;
        }
        document.getElementById("search-fields").style.display = "flex";

        document.getElementById("search-id").value = data.id;
        document.getElementById("search-table-number").value = data.table_number;
        document.getElementById("search-items").value = data.items;
        document.getElementById("search-total-price").value = data.total_price;

        document.querySelector(`input[name="status"][value="${data.status}"]`).checked = true;
    })
    .catch(error => console.error("Ошибка:", error));
});

// для кнопки edit в поиске заказа
document.querySelector(".button-container-vertical button:first-child").addEventListener("click", function() {
    const orderId = document.getElementById("search-id").value;
    const tableNumber = document.getElementById("search-table-number").value;
    const items = document.getElementById("search-items").value;
    const totalPrice = document.getElementById("search-total-price").value;
    const status = document.querySelector("input[name='status']:checked").value;

    fetch("http://127.0.0.1:8000/update_order/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: orderId,
            table_number: tableNumber,
            items: items,
            total_price: totalPrice,
            status: status
        })
    })
    .then(response => response.json())
    .then(data => alert(data.message))
    .catch(error => console.error("Ошибка:", error));
});

// для удаления заказа в поиске
document.querySelector(".button-container-vertical button:last-child").addEventListener("click", function() {
    const orderId = document.getElementById("search-id").value;

    if (!orderId) {
        alert("Введите ID заказа");
        return;
    }

    fetch("http://127.0.0.1:8000/delete_order/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: orderId })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        document.getElementById("search-fields").style.display = "none"; // Скрываем форму после удаления
    })
    .catch(error => console.error("Ошибка:", error));
});

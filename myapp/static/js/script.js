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
    // Показываем новые поля
});

document.getElementById("orders-btn").addEventListener("click", function() {
    document.getElementById("input-container").style.display = "none";
    document.getElementById("search-container").style.display = "none";
    document.getElementById("success-message").style.display = "none";
    document.getElementById("search-fields").style.display = "none";
    document.getElementById("revenue-container").style.display = "none";

    window.open("/page2/", "_blank");
});

document.getElementById("revenue-btn").addEventListener("click", function() {
    document.getElementById("input-container").style.display = "none";
    document.getElementById("search-container").style.display = "none";
    document.getElementById("search-fields").style.display = "none";
    document.getElementById("success-message").style.display = "none";
    document.getElementById("revenue-container").style.display = "flex";
    // Код для отображения
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

        const totalPrice = extractPrice(items); // Итоговая стоимость

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
    document.getElementById("search-fields").style.display = "flex";
    // Код для поиска в бд
});

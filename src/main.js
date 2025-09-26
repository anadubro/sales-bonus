/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
   // @TODO: Расчет выручки от операции
   const { discount, sale_price, quantity } = purchase;

   const transformedDiscount = discount / 100;
   const totalBeforeDiscount = sale_price * quantity;
   const totalAfterDiscount = totalBeforeDiscount * (1 - transformedDiscount);
   return totalAfterDiscount;
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
    // @TODO: Расчет бонуса от позиции в рейтинге
    const { profit } = seller;

    if(index === 0) return profit * 0.15;
    if(index === 1 || index === 2) return profit * 0.10;
    if(index === total - 1) return 0;
    return profit * 0.05;
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
    // @TODO: Проверка входных данных
    if (!data || !data.sellers || !data.products) {
        throw new Error('Некорректные входные данные');
    } 

    const { calculateRevenue, calculateBonus } = options;
    // @TODO: Проверка наличия опций

    let sellerById = data["sellers"].reduce((acc, seller) => {
        acc[seller.id] = seller;
        return acc;
    }, {});

    let productBySku = data["products"].reduce((acc, product) => {
        acc[product.sku] = product;
        return acc;
    }, {});

    const sellerInfoById = data["sellers"].reduce((acc, seller) => {
        acc[seller.id] = {
            seller_id: seller.id,
            name: `${seller.first_name} ${seller.last_name}`,
            revenue: 0,
            profit: 0,
            sales_count: 0,
            top_products: [],
            productById: {},
            bonus: 0,
        };
        return acc;
    }, {});

    for(cheque of data.purchase_records) {
        let sellerInfo = sellerInfoById[cheque.seller_id];

        for(purchaseItem of cheque.items) {
            let itemRevenue = calculateRevenue(purchaseItem, productBySku[purchaseItem.sku]);
            let itemProfit = itemRevenue - productBySku[purchaseItem.sku].purchase_price * purchaseItem.quantity;

            sellerInfo.revenue += itemRevenue;
            sellerInfo.profit += itemProfit;
            sellerInfo.sales_count += purchaseItem.quantity;

            if(sellerInfo.productById[purchaseItem.sku]) {
                sellerInfo.productById[purchaseItem.sku] = 0;
            }
            sellerInfo.productById[purchaseItem.sku] += purchaseItem.quantity;
        }
    };

    const sellerList = Object.values(sellerInfoById).sort(
        (a, b) => b.profit - a.profit
    );

    sellerList.forEach((seller, index) => {
        seller.top_products = Object.values(seller.productById).sort(
            (a, b) => a.quantity - b.quantity
        ).slice(0, 10);
        delete seller.productById;

        seller.bonus += calculateBonus(index, sellerList.length, seller);
    });

    return sellerList;

    // @TODO: Подготовка промежуточных данных для сбора статистики

    // @TODO: Индексация продавцов и товаров для быстрого доступа

    // @TODO: Расчет выручки и прибыли для каждого продавца

    // @TODO: Сортировка продавцов по прибыли

    // @TODO: Назначение премий на основе ранжирования

    // @TODO: Подготовка итоговой коллекции с нужными полями
}



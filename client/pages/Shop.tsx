import { buildInstamojoCheckoutUrl } from '../instamojo';

// ... other code ...

const handleBuyClick = (productId, quizData) => {
    const productName = 'Your Product Name'; // Replace with actual product name
    const price = 100; // Replace with actual price
    const customerName = quizData.name;
    const customerEmail = quizData.email;
    const customerPhone = quizData.phone;
    const redirectUrl = 'https://yourdomain.com/payment-success.html?product_id=' + productId;

    const checkoutUrl = buildInstamojoCheckoutUrl(productName, price, customerName, customerEmail, customerPhone, redirectUrl);

    window.location.href = checkoutUrl;
};

// ... other code ...
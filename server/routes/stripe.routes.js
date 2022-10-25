const router = require("express").Router();

router.get("/secret", async (req, res, next) => {
    // Set your secret key. Remember to switch to your live secret key in production.
    // See your keys here: https://dashboard.stripe.com/apikeys
    const stripe = require('stripe')('sk_test_51LwfahSJXufRRU6t1yw1ymOCUhyOodNDnJXBT8dH6kRGhgh5BnhmyBUxGGee7F0IuOS6H4TwPfnygHzTQVbQjG0g003WICl52f');

    const paymentIntent = await stripe.paymentIntents.create({
        amount: 1099,
        currency: 'inr',
        automatic_payment_methods: {enabled: true},
    });

    res.json({client_secret: paymentIntent.client_secret});
});

module.exports = router;

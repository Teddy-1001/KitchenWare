import express from 'express';
import pool from './db/config.js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { auth } from './middleware/auth.js';
import session from 'express-session';
import { admin } from './middleware/admin.js';
import axios from 'axios';
import { stkPush } from './public/js/mpesa_push.js';
import upload from './middleware/upload.js';
import cloudinary from './db/cloudinary.js';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();
const app = express();

const calcShipping = (subtotal) => (subtotal > 0 ? Math.round(subtotal * 0.05) : 0);

const calcOrderTotals = (cart) => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = calcShipping(subtotal);
    return { subtotal, shipping, total: subtotal + shipping };
};

const formatPhone = (phone) => {
    if (!phone) return phone;
    const cleaned = String(phone).replace(/\s+/g, '');
    if (cleaned.startsWith('0')) return '254' + cleaned.substring(1);
    if (cleaned.startsWith('+')) return cleaned.substring(1);
    return cleaned;
};

const syncCartCookie = (req, res) => {
    if (!req.session?.cart?.length) {
        res.clearCookie('cart');
        return;
    }
    res.cookie('cart', JSON.stringify(req.session.cart), {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
};

const clearCart = (req, res) => {
    req.session.cart = [];
    res.clearCookie('cart');
};

app.use(express.static('public'));
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set('view engine', 'ejs');
// app.set('views', './views');
app.set("views", path.join(__dirname, "views"));
app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: '73b1e9cff94cf52cf953f0181d935488',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}))


app.use((req, res, next) => {
    // 1. Restore cart from cookie if it exists and session is empty
    if (!req.session.cart) {
        if (req.cookies.cart) {
            try {
                req.session.cart = JSON.parse(req.cookies.cart);
            } catch (e) {
                req.session.cart = [];
            }
        } else {
            req.session.cart = [];
        }
    }
    next();
});

app.use((req, res, next) => {
    // 2. Decode user JWT globally
    const token = req.cookies?.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            res.locals.user = decoded;
        } catch (error) {
            res.clearCookie('token');
            req.user = null;
            res.locals.user = null;
        }
    } else {
        req.user = null;
        res.locals.user = null;
    }

    // 3. Populate cart and total info globally
    const cart = req.session.cart || [];
    res.locals.cart = cart;
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    res.locals.cartCount = cartCount;

    const total = cart.reduce((sum, item) => {
        return sum + item.price * item.quantity;
    }, 0);
    res.locals.total = total;
    const delivery = calcShipping(total);
    const grandTotal = total + delivery;
    res.locals.grandTotal = grandTotal;

    // 4. Overwrite redirect & render to sync cart cookie
    const origRedirect = res.redirect;
    res.redirect = function (...args) {
        syncCartCookie(req, res);
        return origRedirect.apply(this, args);
    };

    const origRender = res.render;
    res.render = function (...args) {
        syncCartCookie(req, res);
        return origRender.apply(this, args);
    };

    next();
});

pool.connect().then(() => {
    console.log('Connected to the database');
})
    .catch((err) => {
        console.error('Error connecting to the database', err);
    });



app.get('/', auth, (req, res) => {

    // if (!token) {
    //     return res.redirect('/login');
    // }
    console.log(req.user)
    res.render('index', { user: req.user });
})
app.get('/all-utensils', async (req, res) => {
    // const utensils = [
    //     {
    //         name: "Chef Knife",
    //         description: "Professional stainless steel knife",
    //         price: 1999,
    //         oldPrice: 2500,
    //         badge: "-20%",
    //         image: "/images/pexels-keeganjchecks-10117711.jpg"
    //     },
    //     {
    //         name: "Cooking Pot",
    //         description: "Premium stainless steel cookware",
    //         price: 4999,
    //         oldPrice: 6000,
    //         badge: "Best Seller",
    //         image: "/images/pexels-keeganjchecks-10117711.jpg"
    //     },
    //     {
    //         name: "Frying Pan",
    //         description: "Non-stick pan for healthy cooking",
    //         price: 3500,
    //         badge: "New",
    //         image: "/images/pexels-keeganjchecks-10117711.jpg"
    //     }
    // ];
    const category = req.query.category || 'All';
    try {
        let result;
        if (category === 'All') {
            result = await pool.query('SELECT utensils.*, categories.name AS category_name FROM utensils JOIN categories ON utensils.category_id = categories.id');
        } else {
            result = await pool.query(`SELECT utensils.*, categories.name AS category_name
                FROM utensils
                JOIN categories ON utensils.category_id = categories.id
                WHERE categories.name = $1
            `, [category]);
        }
        res.render('all-utensils', {
            utensils: result.rows,
            cart: req.session.cart || [],
            category,
            user: req.user || null
        });
    } catch (error) {
        console.error(error);
        res.render('all-utensils', {
            utensils: [],
            category,
            user: req.user || null,
            error: 'Something went wrong while fetching utensils'
        });
    }

})
app.get('/register', async (req, res) => {
    res.render('register');
})

app.post('/register', async (req, res) => {
    const { email, password, name, phone } = req.body;
    try {
        // if user already exist
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length > 0) {
            return res.render('register', { error: 'User already exists' });
        }
        //hash password
        const hashedPassword = await bcrypt.hash(password, 10)
        const emails = await pool.query('SELECT email FROM admins');

        const adminCheck = await pool.query(
            'SELECT 1 FROM admins WHERE email = $1',
            [email]
        );

        const role =
            adminCheck.rows.length > 0
                ? 'admin'
                : 'customer';

        const newUser = await pool.query(
            'INSERT INTO users (email, password, name, phone, role) VALUES ($1, $2, $3, $4, $5)',
            [email, hashedPassword, name, phone, role]
        );
        // return res.render('register', {
        //     success: "User registered successfully",
        //     error: null
        // });
        return res.redirect('/login')

    } catch (error) {
        console.error(error);
        res.render('register', {
            error: 'Something went wrong',
            success: null
        });
    }
})

app.get('/login', async (req, res) => {
    const hash = await bcrypt.hash("12345678", 10);

    console.log(hash);
    res.render('login');
})
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.render('login', {
                error: 'Invalid email or password'
            });
        }

        const user = result.rows[0];
        // console.log(password);
        // console.log(user.password);
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log('not matching');
            return res.render('login', {
                error: 'Invalid email or password'
            });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, name: user.name, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000
        });

        return res.redirect('/');

    } catch (error) {
        console.error(error);
        return res.render('login', {
            error: 'Something went wrong'
        });
    }
});

app.post('/logout', (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });

    res.redirect('/login');
})
//add to cart
app.post('/cart/add', async (req, res) => {
    const { id, quantity, redirect } = req.body
    const qty = Math.max(1, parseInt(quantity) || 1)
    try {

        const result = await pool.query(
            'SELECT * FROM utensils WHERE id = $1', [id]
        )
        const item = result.rows[0]
        if (!item) {
            return res.status(404).send('Item not found')
        }
        //check if already in cart
        const existing = req.session.cart.find(p => p.id === item.id)
        if (existing) {
            existing.quantity += qty
        } else {
            req.session.cart.push({
                id: item.id,
                name: item.name,
                price: Number(item.price),
                image_url: item.image_url,
                quantity: qty
            })
        }

        // Redirect logic: to checkout if Buy Now, else referrer page with cart_open=true
        let safeDest = '/all-utensils';
        if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
            safeDest = redirect;
        } else if (req.get('referer')) {
            try {
                const refUrl = new URL(req.get('referer'));
                if (refUrl.host === req.get('host')) {
                    safeDest = refUrl.pathname + refUrl.search;
                }
            } catch (e) {
                // Ignore parsing errors and fallback
            }
        }

        if (safeDest !== '/checkout') {
            // Append ?cart_open=true, ensuring we don't duplicate it
            safeDest = safeDest.replace(/[?&]cart_open=true/, '');
            const finalSeparator = safeDest.includes('?') ? '&' : '?';
            safeDest = safeDest + finalSeparator + 'cart_open=true';
        }

        res.redirect(safeDest)
    } catch (error) {
        console.error(error);
        res.send('Error adding to cart');
    }
})
//view cart
app.get('/cart', (req, res) => {
    const cart = req.session.cart || []
    const { subtotal: total, shipping: delivery, total: grandTotal } = calcOrderTotals(cart)
    // console.log(cart)
    res.render('cart', {
        cart,
        total,
        delivery,
        grandTotal,
        user: req.user
    })
})
//increase quantity
app.post('/cart/increase', (req, res) => {

    const { id } = req.body
    const cart = req.session.cart
    const target = req.session.cart.find(
        item => item.id === Number(id)
    );
    if (target) {
        target.quantity += 1
    }
    // const destination = (redirect.)
    res.redirect(req.get('referer'));
})

//decrease quantity
app.post('/cart/decrease', (req, res) => {

    const { id } = req.body
    const cart = req.session.cart
    const target = req.session.cart.find(
        item => item.id === Number(id)
    );
    if (target) {
        target.quantity -= 1
        if (target.quantity <= 0) {
            req.session.cart = cart.filter(
                item => item.id !== Number(id)
            );
        }
    }
    res.redirect(req.get('referer'));
})

//remove from cart
app.post('/cart/remove', (req, res) => {
    const { id } = req.body
    req.session.cart = req.session.cart.filter(item => item.id !== parseInt(id))
    res.redirect('/cart')
})

//clear cart
app.post('/cart/clear', (req, res) => {
    clearCart(req, res)
    res.redirect('/cart')
})
//product detail
app.get('/utensil/:id', async (req, res) => {
    const { id } = req.params;
    const result = await pool.query(`SELECT 
      u.*,
      c.name AS category_name
    FROM utensils u
    LEFT JOIN categories c
    ON u.category_id = c.id
    WHERE u.id = $1
    `,
        [id])
    const utensil = result.rows[0]

    if (!utensil) {
        return res.status(404).send('Utensil not found');
    }

    const cartItem = (req.session.cart || []).find(item => item.id === Number(id));
    const cartQuantity = cartItem?.quantity ?? 1;

    console.log(utensil)
    res.render('ProductDetail', { utensil, cartQuantity });

})

//offers page
app.get('/offers', async (req, res) => {
    const category = req.query.category || 'All';
    try {
        let result;
        if (category === 'All') {
            // SELECT * FROM utensils WHERE is_offer = TRUE;
            result = await pool.query('SELECT utensils.*, categories.name AS category_name FROM utensils JOIN categories ON utensils.category_id = categories.id WHERE is_offer = TRUE');
        }
        // else {
        //     result = await pool.query(`SELECT utensils.*, categories.name AS category_name
        //         FROM utensils
        //         JOIN categories ON utensils.category_id = categories.id
        //         WHERE categories.name = $1
        //     `, [category]);
        // }
        res.render('offers', {
            utensils: result.rows,
            cart: req.session.cart || [],
            category,
            user: req.user || null
        });
    } catch (error) {
        console.error(error);
        res.render('offers', {
            utensils: [],
            category,
            user: req.user || null,
            error: 'Something went wrong while fetching utensils'
        });
    }
})

// app.get('/checkout', (req, res) => {
//     const cart = req.session.cart || []
//     if (!cart.length) {
//         return res.redirect('/cart');
//     }
//     res.render('checkout', {
//         cart
//     })
// })
app.get('/checkout', (req, res) => {
    const cart = req.session.cart || [];

    if (!cart.length) {
        return res.redirect('/cart');
    }

    const user = res.locals.user || null;

    const { subtotal, shipping, total } = calcOrderTotals(cart);

    res.render('checkout', {
        cart,
        user,
        subtotal,
        shipping,
        total
    });
});

app.post('/checkout/place-order', async (req, res) => {
    const {
        name,
        phone,
        email,
        address,
        county,
        city,
        notes,
        payment_method,
        mpesa_phone
    } = req.body;

    const cart = req.session.cart || [];

    if (!cart.length) {
        return res.status(400).json({ error: 'Cart is empty' });
    }

    if (!name?.trim() || !phone?.trim() || !address?.trim() || !county?.trim() || !city?.trim()) {
        return res.status(400).json({ error: 'Please fill in all required delivery fields' });
    }

    try {
        const { subtotal, shipping, total } = calcOrderTotals(cart);

        const orderResult = await pool.query(
            `INSERT INTO orders
            (user_id, 
            subtotal, 
            shipping_fee, 
            total, 
            delivery_address, 
            phone, 
            payment_method, payment_status, notes)
            VALUES ($1,$2,$3,$4,$5,$6,$7, 'unpaid', $8)
            RETURNING id`,
            [
                req.user?.userId || null,
                subtotal,
                shipping,
                total,
                `${address}, ${city}, ${county}`,
                phone,
                payment_method,
                notes
            ]
        );

        const orderId = orderResult.rows[0].id;

        for (const item of cart) {
            await pool.query(
                `INSERT INTO order_items
                (order_id, utensil_id, quantity, price)
                VALUES ($1,$2,$3,$4)`,
                [orderId, item.id, item.quantity, item.price]
            );
        }

        if (payment_method === 'mpesa') {
            const payPhone = formatPhone(mpesa_phone || phone);
            if (!payPhone) {
                return res.status(400).json({ error: 'M-Pesa phone number is required' });
            }

            const stkResponse = await stkPush(payPhone, Math.round(total), orderId);
            console.log(stkResponse);

            if (stkResponse.ResponseCode !== '0') {
                return res.status(400).json({
                    error: stkResponse.ResponseDescription || 'M-Pesa STK push failed'
                });
            }

            const checkoutRequestId = stkResponse.CheckoutRequestID;
            await pool.query(
                `UPDATE orders SET checkout_request_id = $1 WHERE id = $2`,
                [checkoutRequestId, orderId]
            );

            clearCart(req, res);

            return res.json({
                success: true,
                message: 'STK Push sent',
                orderId,
                payment_method: 'mpesa',
                merchantRequestId: stkResponse.MerchantRequestID,
                checkoutRequestId
            });
        }

        clearCart(req, res);

        return res.json({
            success: true,
            orderId,
            payment_method: payment_method || 'card'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Checkout failed' });
    }
});

app.get('/checkout/order-status/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT payment_status, payment_method, status FROM orders WHERE id = $1`,
            [req.params.id]
        );

        if (!result.rows.length) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not fetch order status' });
    }
});

app.get('/order-success/:id', async (req, res) => {
    const orderId = req.params.id;

    clearCart(req, res);

    const order = await pool.query(
        `SELECT * FROM orders WHERE id = $1`,
        [orderId]
    );

    if (!order.rows.length) {
        return res.redirect('/cart');
    }
    const getOrderItemsQuery = `
    SELECT 
        oi.id,
        oi.quantity,
        oi.price,
        u.name,
        u.image_url
    FROM order_items oi
    JOIN utensils u 
        ON u.id = oi.utensil_id
    WHERE oi.order_id = $1
`;
    const items = await pool.query(
        getOrderItemsQuery,
        [orderId]
    );


    res.render('order-success', {
        order: order.rows[0],
        items: items.rows
    });
});
//mpesa callback
app.post('/mpesa/callback', async (req, res) => {
    try {

        const callback = req.body.Body.stkCallback;
        if (callback.ResultCode === 0) {
            const metadata = callback.CallbackMetadata.Item
            const receipt = metadata.find(
                item => item.Name === "MpesaReceiptNumber"
            )?.Value
            const amount = metadata.find(
                item => item.Name === "Amount"
            )?.Value
            const phone = metadata.find(
                item => item.Name === "PhoneNumber"
            )?.Value
            const checkoutRequestId = callback.CheckoutRequestID
            const MerchantRequestID = callback.MerchantRequestID
            console.log("Callback CheckoutRequestID:", checkoutRequestId);
            await pool.query(`UPDATE orders SET payment_status = 'paid', transaction_ref = $1 WHERE checkout_request_id = $2`, [receipt, checkoutRequestId]);
            console.log('Payment completed', receipt)
        } else {
            console.log(
                "Payment failed:",
                callback.ResultDesc
            );
        }
        res.json({
            ResultCode: 0,
            ResultDesc: "Accepted"
        });



    } catch (error) {
        console.log(error);

        res.status(500).json({
            error: "callback failed"
        });
    }
})



//admin
app.get('/admin/products', auth, admin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT u.*, c.name AS category_name
            FROM utensils u
            LEFT JOIN categories c ON u.category_id = c.id
            ORDER BY u.created_at DESC
        `);
        res.render('admin/products', { products: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).send('Could not load products');
    }
});

app.get('/admin/add-product', auth, admin, async (req, res) => {
    const categories = await pool.query('SELECT * FROM categories')
    res.render('admin/add-product', { utensil: [], cartQuantity: 2, categories: categories.rows, error: req.query.error || null })
})

app.post('/admin/add-product', auth, admin, (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            return res.redirect('/admin/add-product?error=' + encodeURIComponent(err.message));
        }
        next();
    });
}, async (req, res) => {
    const categories = await pool.query('SELECT * FROM categories');

    try {
        const { name, description, category_id, price, old_price, stock, badge } = req.body;

        if (!name?.trim() || !category_id || !price || stock === undefined || stock === '') {
            return res.status(400).render('admin/add-product', {
                utensil: [],
                cartQuantity: 2,
                categories: categories.rows,
                error: 'Please fill in all required fields.'
            });
        }

        if (!req.file) {
            return res.status(400).render('admin/add-product', {
                utensil: [],
                cartQuantity: 2,
                categories: categories.rows,
                error: 'Product image is required.'
            });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'kitchenware/products'
        });

        const imageUrl = result.secure_url;

        await fs.unlink(req.file.path).catch(() => { });

        await pool.query(
            `INSERT INTO utensils(name, description, category_id, price, old_price, stock, badge, image_url)
             VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,
            [name, description, category_id, price, old_price || null, stock, badge || null, imageUrl]
        );

        res.redirect('/admin/products');
    } catch (error) {
        console.error(error);

        if (req.file?.path) {
            await fs.unlink(req.file.path).catch(() => { });
        }

        res.status(500).render('admin/add-product', {
            utensil: [],
            cartQuantity: 2,
            categories: categories.rows,
            error: 'Could not add product. Check Cloudinary credentials and try again.'
        });
    }
})

//update stock
app.put('admin/update-stock', admin, async (req, res) => {
    try {
        const { id, stock } = req.body

    } catch (error) {

    }
})








// app.listen(3200, () => {
//     console.log('Server is running on port 3200');
// });
const PORT = process.env.PORT || 3200;

if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(`Server running on ${PORT}`);
    });
}

export default app
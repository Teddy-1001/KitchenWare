import express from 'express';
import pool from './db/config.js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { auth } from './middleware/auth.js';
import session from 'express-session';
import { admin } from './middleware/admin.js';

dotenv.config();
const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({ extended: true }));
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
    if (!req.session.cart) {
        req.session.cart = []
    }
    next()
})
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    const cart = req.session.cart || [];
    res.locals.cart = cart

    const total = cart.reduce((sum, item) => {
        return sum + item.price * item.quantity
    }, 0)
    res.locals.total = total
    const delivery = total > 0 ? 300 : 0
    const grandTotal = total + delivery
    res.locals.grandTotal = grandTotal

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

app.get('/login', (req, res) => {
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
        // Redirect to checkout if Buy Now, otherwise to cart
        const safeDest = (redirect && !redirect.startsWith('/utensil') && redirect.startsWith('/') && !redirect.startsWith('//')) ? redirect : '/cart';
        res.redirect(safeDest)
    } catch (error) {
        console.error(error);
        res.send('Error adding to cart');
    }
})
//view cart
app.get('/cart', (req, res) => {
    const cart = req.session.cart || []
    const total = cart.reduce((sum, item) => {
        return sum + item.price * item.quantity
    }, 0)
    const delivery = total > 0 ? 300 : 0
    const grandTotal = total + delivery
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
    req.session.cart = []
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

//admin
app.get('/admin/add-product', auth, async (req, res)=>{
    const categories = await pool.query('SELECT * FROM categories')
    res.render('admin/add-product', {utensil: [], cartQuantity: 2, categories: categories.rows})
})









app.listen(3200, () => {
    console.log('Server is running on port 3200');
});
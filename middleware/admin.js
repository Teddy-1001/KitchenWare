import jwt from 'jsonwebtoken';

export const admin = (req, res, next) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    if (req.user.role !== 'admin') {
        return res.status(403).render('403', {
            message: "Access denied: Admins only"
        });
        next()
    }
}
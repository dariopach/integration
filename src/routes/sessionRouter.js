import { Router } from "express";
import passport from "passport";

const router = Router();

router.get('/current', (req, res, next) => {
  passport.authenticate('jwt', function (err, user, info) {
    if (err) return next(err);
    if (!user) {
      return res.status(401).send({
        error: info.messages ? info.messages : info.toString()
      });
    }

    const userDTO = {
      id: user.email,
      username: user.first_name, 
    };

    req.user = userDTO; 
    next();
  })(req, res, next);
}, (req, res) => {
  res.send({
    status: 'success',
    payload: req.user
  });
});

export default router;
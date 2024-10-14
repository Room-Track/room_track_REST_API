import { Router } from 'express';
import admin from 'firebase-admin';

const router = Router();

router.post('/signup', async (req, res) => {
	if (!req.body.email || !req.body.password) {
		res.status(400).json({ msg: 'Fields must be complete' });
		return;
	}

	const response = await admin.auth().createUser({
		email: req.body.email,
		password: req.body.password,
		emailVerified: false,
		disabled: false,
	});
	res.status(200).json(response);
});

export default router;

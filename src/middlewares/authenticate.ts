import type { NextFunction, Response, Request } from 'express';
import admin from 'firebase-admin';
import type { DecodedIdToken } from 'firebase-admin/auth';

declare module 'express' {
	interface Request {
		token?: DecodedIdToken;
	}
}

export default function authenticate(
	req: Request<any, Record<string, any>>,
	res: Response<any, Record<string, any>>,
	next: NextFunction
): void | Promise<void> {
	const authToken = req.headers.authorization;
	if (!authToken) {
		res.status(400).json({ msg: 'No authorization token given' });
		return;
	}
	admin
		.auth()
		.verifyIdToken(authToken)
		.then((decodedToken) => {
			req.token = decodedToken;
			next();
		})
		.catch((err) => {
			res.status(401).send({ msg: 'Unauthorized' });
		});
}

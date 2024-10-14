import type { Request } from 'express';
import { Router } from 'express';
import authenticate from '../middlewares/authenticate';
import { query } from '../database';
import type { CosmosClient } from '@azure/cosmos';

const router = Router();
router.use(authenticate);

router.get('/tagged', async (req: Request, res) => {
	const limit = Number(req.query['limit']);
	const client: CosmosClient = req.app.get('client');
	//@ts-ignore
	const user: stirng = req.token?.email;
	const result = await query(client, 'Tags', {
		query: 'SELECT * FROM r WHERE r.user = @user OFFSET 0 LIMIT @limit',
		parameters: [
			{
				name: '@user',
				value: user,
			},
			{
				name: '@limit',
				value: limit,
			},
		],
	});
	res.status(200).json({
		array: result,
	});
});

router.get('/', async (req: Request, res) => {
	if (!req.query['name']) {
		res.status(200).json({ array: [] });
		return;
	}

	const limit = Number(req.query['limit']);

	const client: CosmosClient = req.app.get('client');
	const result = await query(client, 'Cards', {
		query:
			'SELECT * FROM r WHERE CONTAINS(r.name, @name) OFFSET 0 LIMIT @limit',
		parameters: [
			{
				name: '@name',
				value: req.query['name'].toString(),
			},
			{
				name: '@limit',
				value: limit,
			},
		],
	});

	res.status(200).json({
		array: result,
	});
});

export default router;

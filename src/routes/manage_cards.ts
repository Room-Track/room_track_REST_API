import type { Request } from 'express';
import { Router } from 'express';
import authenticate from '../middlewares/authenticate';
import type { CosmosClient } from '@azure/cosmos';
import { createFamilyItem, deleteFamilyItem, query } from '../database';

const router = Router();
router.use(authenticate);

router.post('/', async (req: Request, res) => {
	if (!req.query.name || !req.query.type) {
		res.status(200);
		return;
	}
	const client: CosmosClient = req.app.get('client');
	//@ts-ignore
	const user: string = req.token?.email;

	await createFamilyItem(client, 'Favorites', {
		name: req.query.name.toString(),
		type: req.query.type.toString(),
		user: user,
	});

	res.status(200);
});

router.delete('/', async (req: Request, res) => {
	if (!req.body.name || !req.body.type) {
		res.status(200);
		return;
	}
	const client: CosmosClient = req.app.get('client');
	//@ts-ignore
	const user: string = req.token?.email;

	const results = await query(client, 'Favorites', {
		query:
			'SELECT * FROM r WHERE r.name = @name AND r.user = @user AND r.type = @type',
		parameters: [
			{
				name: '@name',
				value: req.body.name,
			},
			{
				name: '@user',
				value: user,
			},
			{
				name: '@type',
				value: req.body.type,
			},
		],
	});

	const doc = results.at(0);
	await deleteFamilyItem(client, 'Favorites', doc.id, doc);

	res.status(200);
});

export default router;

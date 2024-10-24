import type { Request } from 'express';
import { Router } from 'express';
import authenticate from '../middlewares/authenticate';
import type { CosmosClient } from '@azure/cosmos';
import { createFamilyItem, deleteFamilyItem, query } from '../database';

const router = Router();
router.use(authenticate);

router.post('/', async (req: Request, res) => {
	if (!req.body.name) {
		res.status(400).json({
			msg: 'Name field is needed in body',
		});
		return;
	}

	const client: CosmosClient = req.app.get('client');
	//@ts-ignore
	const user: string = req.token?.email;

	try {
		await createFamilyItem(client, 'Favorites', {
			name: req.body.name.toString(),
			user: user,
		});

		res.status(200).json({
			msg: 'Request procesed succesfully',
		});
	} catch {
		res.status(500).json({
			msg: 'Server error',
		});
	}
});

router.delete('/', async (req: Request, res) => {
	if (!req.body.name) {
		res.status(400).json({
			msg: 'Name field is needed in body',
		});
		return;
	}

	const client: CosmosClient = req.app.get('client');
	//@ts-ignore
	const user: string = req.token?.email;

	try {
		const results = await query(client, 'Favorites', {
			query: 'SELECT * FROM r WHERE r.name = @name AND r.user = @user',
			parameters: [
				{
					name: '@name',
					value: req.body.name,
				},
				{
					name: '@user',
					value: user,
				},
			],
		});

		const doc = results.at(0);
		await deleteFamilyItem(client, 'Favorites', doc.id, doc);

		res.status(200).json({
			msg: 'Request procesed succesfully',
		});
	} catch {
		res.status(500).json({
			msg: 'Server error',
		});
	}
});

export default router;

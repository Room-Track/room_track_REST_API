import type { Request } from 'express';
import { Router } from 'express';
import authenticate from '../middlewares/authenticate';
import { createFamilyItem, deleteFamilyItem, query } from '../database';
import type { CosmosClient } from '@azure/cosmos';

const router = Router();
router.use(authenticate);

router.put('/tag', async (req: Request, res) => {
	if (!req.query['name'] || req.query['toTagged'] == null) {
		res.status(200);
		return;
	}
	const client: CosmosClient = req.app.get('client');
	//@ts-ignore
	const user: string = req.token?.email;

	if (req.query['toTagged'] === 'true') {
		await createFamilyItem(client, 'Tags', {
			name: req.query['name'].toString(),
			user: user,
		});
	} else {
		const results = await query(client, 'Tags', {
			query: 'SELECT * FROM r WHERE r.name = @name AND r.user = @user',
			parameters: [
				{
					name: '@name',
					value: req.query['name'].toString(),
				},
				{
					name: '@user',
					value: user,
				},
			],
		});
		const doc = results.at(0);
		await deleteFamilyItem(client, 'Tags', doc.id, doc);
	}
	res.status(200);
});

export default router;

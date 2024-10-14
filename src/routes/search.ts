import type { Request } from 'express';
import { Router } from 'express';
import authenticate from '../middlewares/authenticate';
import { query } from '../database';
import type { CosmosClient } from '@azure/cosmos';

const router = Router();
router.use(authenticate);

router.get('/tagged', async (req: Request, res) => {
	const limit = Number(req.query['limit']) || 20;
	const client: CosmosClient = req.app.get('client');
	//@ts-ignore
	const user: string = req.token?.email;
	const result_tags = await query(client, 'Tags', {
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

	const names = result_tags.map((doc) => doc.name);
	const result_cards = await query(client, 'Cards', {
		query: 'SELECT * FROM r WHERE ARRAY_CONTAINS(@names, r.name)',
		parameters: [
			{
				name: '@names',
				value: names,
			},
		],
	});

	res.status(200).json({
		array: result_cards,
	});
});

router.get('/', async (req: Request, res) => {
	if (!req.query['name']) {
		res.status(200).json({ array: [] });
		return;
	}

	const limit = Number(req.query['limit']) || 50;

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

router.get('/card', async (req: Request, res) => {
	if (!req.query['name']) {
		res.status(200).json({ array: [] });
		return;
	}
	const client: CosmosClient = req.app.get('client');
	//@ts-ignore
	const user: string = req.token?.email;
	const result_tags = await query(client, 'Tags', {
		query:
			'SELECT * FROM r WHERE r.user = @user AND r.name = @name OFFSET 0 LIMIT @limit',
		parameters: [
			{
				name: '@user',
				value: user,
			},
			{
				name: '@name',
				value: req.query['name'].toString(),
			},
			{
				name: '@limit',
				value: 1,
			},
		],
	});

	const result_cards = await query(client, 'Cards', {
		query:
			'SELECT * FROM r WHERE CONTAINS(r.name, @name) OFFSET 0 LIMIT @limit',
		parameters: [
			{
				name: '@name',
				value: req.query['name'].toString(),
			},
			{
				name: '@limit',
				value: 1,
			},
		],
	});

	const isTagged = result_tags.length != 0;

	const doc = result_cards.at(0);

	res.status(200).json({
		array: [doc],
		tagged: isTagged,
	});
});

export default router;

import type { Request } from 'express';
import { Router } from 'express';
import authenticate from '../middlewares/authenticate';
import { query } from '../database';
import type { CosmosClient } from '@azure/cosmos';

const router = Router();
router.use(authenticate);

router.get('/favorites', async (req: Request, res) => {
	const client: CosmosClient = req.app.get('client');
	//@ts-ignore
	const user: string = req.token?.email;
	const result_favorites = await query(client, 'Favorites', {
		query: 'SELECT * FROM r WHERE r.user = @user',
		parameters: [
			{
				name: '@user',
				value: user,
			},
		],
	});
	const names = result_favorites.map((doc) => doc.name);
	const result_basic = await query(client, 'BasicInfo', {
		query: 'SELECT * FROM r WHERE ARRAY_CONTAINS(@names, r.name)',
		parameters: [
			{
				name: '@names',
				value: names,
			},
		],
	});

	const result = result_basic.map((card) => {
		return {
			isFavorite: true,
			...card,
		};
	});

	res.status(200).json({
		data: result,
	});
});

router.get('/', async (req: Request, res) => {
	if (!req.query['name']) {
		res.status(200).json({ data: [] });
		return;
	}
	const client: CosmosClient = req.app.get('client');
	//@ts-ignore
	const user: string = req.token?.email;
	const result_info = await query(client, 'BasicInfo', {
		query: 'SELECT * FROM r WHERE CONTAINS(r.name, @name)',
		parameters: [
			{
				name: '@name',
				value: req.query['name'].toString(),
			},
		],
	});

	const names = result_info.map((card) => card.name);

	const result_favorites = await query(client, 'Favorites', {
		query:
			'SELECT * FROM r WHERE ARRAY_CONTAINS(@names, r.name) AND r.user = @user',
		parameters: [
			{
				name: '@names',
				value: names,
			},
			{
				name: '@user',
				value: user,
			},
		],
	});

	const result = result_info.map((card) => {
		return {
			isFavorite: result_favorites.some((fav) => fav.name == card.name),
			...card,
		};
	});

	res.status(200).json({
		data: result,
	});
});

router.get('/building', async (req: Request, res) => {
	if (!req.query['name']) {
		res.status(200).json({ array: [] });
		return;
	}
	const client: CosmosClient = req.app.get('client');

	const result = await query(client, 'Buildings', {
		query: 'SELECT * FROM r WHERE r.name = @name',
		parameters: [
			{
				name: '@name',
				value: req.query['name'].toString(),
			},
		],
	});

	res.status(200).json({
		data: result.at(0),
	});
});

export default router;

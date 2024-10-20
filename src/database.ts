import {
	CosmosClient,
	PartitionKeyKind,
	type SqlQuerySpec,
} from '@azure/cosmos';
import { log } from './middlewares/logger';
import databaseConfig from '../cosmosDB.json';
import { temp_basic_info_data } from './tempData/basic_info';
import { temp_favorites_data } from './tempData/favorites';

export function getClient(): CosmosClient {
	return new CosmosClient({
		endpoint: databaseConfig.endpoint,
		key: databaseConfig.authKey,
		userAgentSuffix: 'room-track-api',
	});
}

export async function createDatabase(client: CosmosClient) {
	const { database } = await client.databases.createIfNotExists({
		id: databaseConfig.databaseId,
	});
	log(['Database'.green], 0);
	log([`Database Id:${database.id}`], 1);
}

export async function createContainers(client: CosmosClient) {
	log(['Conatiner'.green], 0);
	for (const c of databaseConfig.containers) {
		const { container } = await client
			.database(databaseConfig.databaseId)
			.containers.createIfNotExists({
				id: c.id,
				partitionKey: {
					kind: PartitionKeyKind.Hash,
					paths: c.paths,
				},
			});
		log([`Container Id:${container.id}`], 1);
	}
}

export async function createFamilyItem(
	client: CosmosClient,
	containerId: string,
	fItem: Object
) {
	const { item } = await client
		.database(databaseConfig.databaseId)
		.container(containerId)
		.items.upsert(fItem);
	return item;
}

export async function deleteFamilyItem(
	client: CosmosClient,
	containerId: string,
	itemId: string,
	itemBody: Object
) {
	await client
		.database(databaseConfig.databaseId)
		.container(containerId)
		.item(itemId)
		.delete(itemBody);
}

export async function query(
	client: CosmosClient,
	containerId: string,
	querySpec: SqlQuerySpec
) {
	const { resources } = await client
		.database(databaseConfig.databaseId)
		.container(containerId)
		.items.query(querySpec)
		.fetchAll();
	return resources;
}

export async function dropDatabase(client: CosmosClient) {
	log(['Database'.green], 0);
	const { database } = await client
		.database(databaseConfig.databaseId)
		.delete();
	log([`Delted Id:${database.id}`], 1);
}

export async function fillDatabase(client: CosmosClient) {
	log(['Filling'.green], 0);
	log(['BasicInfo'], 1);
	log('.'.repeat(temp_basic_info_data.length), 1);
	console.write('   ');
	for (const info of temp_basic_info_data) {
		await createFamilyItem(client, 'BasicInfo', info);
		console.write('|'.blue);
	}
	console.write('\n');
	log(['Ready'], 1);
	log(['Favorites'], 1);
	log('.'.repeat(temp_favorites_data.length), 1);
	console.write('   ');
	for (const info of temp_favorites_data) {
		await createFamilyItem(client, 'Favorites', info);
		console.write('|'.blue);
	}
	console.write('\n');
	log(['Ready'], 1);
}

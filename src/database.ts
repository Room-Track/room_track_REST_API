import {
	CosmosClient,
	PartitionKeyKind,
	type SqlQuerySpec,
} from '@azure/cosmos';
import { log } from './middlewares/logger';
import databaseConfig from '../cosmosDB.json';


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

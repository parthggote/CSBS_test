import { MongoClient, Db } from 'mongodb';

const uri = 'mongodb+srv://parthgote:whC50ms9WaGP8S8A@cluster0.fclyu.mongodb.net';
const dbName = 'CSBS';

let client: MongoClient;
let db: Db;

export async function getDb(): Promise<Db> {
  if (!client || !db) {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
  }
  return db;
} 
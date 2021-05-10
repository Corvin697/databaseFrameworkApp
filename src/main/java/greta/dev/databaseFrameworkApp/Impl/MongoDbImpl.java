package greta.dev.databaseFrameworkApp.Impl;

import com.mongodb.*;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.MongoDatabase;
import greta.dev.databaseFrameworkApp.MongoDb;
import org.bson.Document;
import org.bson.types.ObjectId;


public class MongoDbImpl implements MongoDb {

    public static MongoClient mongoClient;
    public static MongoDatabase mongoDatabase;
    public static MongoCollection mongoCollection;

    @Override
    public MongoDatabase connectToMongoDb(String url, String database) {
        try {
            MongoClientURI uri = new MongoClientURI("mongodb+srv://" + url);
            MongoClient mongoClient = new MongoClient(uri);
            MongoDatabase mongoDatabase = mongoClient.getDatabase(database);
            return mongoDatabase;
        }
        catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    @Override
    public MongoCollection getMongoCollection(String collection, MongoDatabase mongoDatabase) {
        try {
            MongoCollection mongoCollection = mongoDatabase.getCollection(collection);
            return mongoCollection;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    @Override
    public Document createMongoDocument(String[] keys, String[] values) {
        try {
            Document document = new Document("_id", new ObjectId());
            for (int i = 0; i < keys.length; i++) {
                document.append(keys[i], values[i]);
            }
            return document;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    @Override
    public Document [] getCollectionDocuments(String collection, MongoDatabase database) {
        try {
            int i = 0;
            MongoCollection mongoCollection = getMongoCollection(collection, database);
            long countDocuments = mongoCollection.countDocuments();
            Document [] documents = new Document[(int) countDocuments];
            FindIterable<Document> findIterable = mongoCollection.find();
            MongoCursor<Document> mongoCursor = findIterable.iterator();
            while (mongoCursor.hasNext()) {
                documents[i] = mongoCursor.next();
                i++;
            }
            return documents;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    @Override
    public Document [] getDocumentsByKey (String key, String collection, MongoDatabase database) {
        try {
            int i = 0;
            MongoCollection mongoCollection = getMongoCollection(collection, database);
            long countDocuments = mongoCollection.countDocuments();
            Document [] foundDocuments = new Document[(int) countDocuments];
            FindIterable<Document> findIterable = mongoCollection.find();
            MongoCursor<Document> mongoCursor = findIterable.iterator();
            while (mongoCursor.hasNext()) {
                Document document = mongoCursor.next();
                if(document.containsKey(key)) {
                    foundDocuments[i] = document;
                    i++;
                }
            }
            return foundDocuments;
        }
        catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
    @Override
    public Document [] getDocumentsByValue (String value, String collection, MongoDatabase database) {
        try {
            int i = 0;
            MongoCollection mongoCollection = getMongoCollection(collection, database);
            long countDocuments = mongoCollection.countDocuments();
            Document [] foundDocuments = new Document[(int) countDocuments];
            FindIterable<Document> findIterable = mongoCollection.find();
            MongoCursor<Document> mongoCursor = findIterable.iterator();
            while (mongoCursor.hasNext()) {
                Document document = mongoCursor.next();
                if(document.containsValue(value)) {
                    foundDocuments[i] = document;
                    i++;
                }
            }
            return foundDocuments;
        }
        catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    @Override
    public Document [] getDocumentsByKeyValue (String key, String value, String collection, MongoDatabase database) {
        try {
            int i = 0;
            MongoCollection mongoCollection = getMongoCollection(collection, database);
            long countDocuments = mongoCollection.countDocuments();
            Document [] foundDocuments = new Document[(int) countDocuments];
            FindIterable<Document> findIterable = mongoCollection.find();
            MongoCursor<Document> mongoCursor = findIterable.iterator();
            while (mongoCursor.hasNext()) {
                Document document = mongoCursor.next();
                if(document.containsValue(value) && document.containsKey(key)) {
                    foundDocuments[i] = document;
                    i++;
                }
            }
            return foundDocuments;
        }
        catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
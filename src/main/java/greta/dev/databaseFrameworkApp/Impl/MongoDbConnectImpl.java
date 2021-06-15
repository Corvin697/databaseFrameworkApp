package greta.dev.databaseFrameworkApp.Impl;

import com.mongodb.*;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.MongoDatabase;
import greta.dev.databaseFrameworkApp.MongoDbConnect;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.bson.conversions.Bson;
import static com.mongodb.client.model.Filters.eq;



public class MongoDbConnectImpl implements MongoDbConnect {


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
    public void editDocument (MongoCollection collection, MongoDatabase mongoDatabase, Document [] documents, String [] keys, String [] values) {
        ObjectId objectId = new ObjectId();
        String documentId = values[0];

        //Get the document Object id
        for(int i = 0; i < documents.length; i++) {
            Document document = documents[i];
            objectId = document.getObjectId("_id");
            if(objectId.toString().contains(documentId)) {
                break;
            }
        }
        //Replace the old document with the new table values and keys
        Document document = new Document();
        Bson filter = eq("_id", objectId);
        for(int i = 1; i < values.length; i++) {
            document.append(keys[i], values[i]);
        }
        collection.findOneAndReplace(filter, document);
    }
}




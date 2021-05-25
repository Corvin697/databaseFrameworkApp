package greta.dev.databaseFrameworkApp;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;

public interface MongoDb {

    /**
     * @param url
     * @param database
     * @return
     */
    MongoDatabase connectToMongoDb(String url, String database);

    /**
     * @param collection
     * @return
     */
    MongoCollection getMongoCollection(String collection, MongoDatabase mongoDatabase);

    /**
     * @param keys
     * @param values
     * @return
     */
    Document createMongoDocument(String[] keys, String[] values);

    /**
     * @param collection
     * @param database
     * @return
     */
    Document[] getCollectionDocuments(String collection, MongoDatabase database);

    /**
     * @param collection
     * @param database
     * @return
     */
    Document[] getDocumentsByKey(String key, String collection, MongoDatabase database);

    /**
     * @param value
     * @param collection
     * @param database
     * @return
     */
    Document[] getDocumentsByValue(String value, String collection, MongoDatabase database);

    /**
     * @param key
     * @param value
     * @param collection
     * @param database
     * @return
     */
    Document[] getDocumentsByKeyValue(String key, String value, String collection, MongoDatabase database);

    /**
     *
     * @param collection
     * @param mongoDatabase
     * @param keys
     * @param values
     */
    void editDocument(MongoCollection collection, MongoDatabase mongoDatabase, Document [] documents, String[] keys, String[] values);

}

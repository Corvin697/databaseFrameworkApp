package greta.dev.databaseFrameworkApp;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;

public interface MongoDbConnect {

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
     * @param collection
     * @param database
     * @return
     */
    Document[] getCollectionDocuments(String collection, MongoDatabase database);


    /**
     *
     * @param collection
     * @param mongoDatabase
     * @param keys
     * @param values
     */
    void editDocument(MongoCollection collection, MongoDatabase mongoDatabase, Document [] documents, String[] keys, String[] values);

}

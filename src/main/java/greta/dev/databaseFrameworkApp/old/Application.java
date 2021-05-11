package greta.dev.databaseFrameworkApp.old;

import com.mongodb.Mongo;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import greta.dev.databaseFrameworkApp.Impl.MySqlImpl;
import greta.dev.databaseFrameworkApp.Impl.MongoDbImpl;
import greta.dev.databaseFrameworkApp.MongoDb;
import greta.dev.databaseFrameworkApp.MySql;
import org.bson.Document;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;


public class Application{

    public static void main(String[] args) throws SQLException {
        MySql mySql = new MySqlImpl();
        MongoDb mongoDb = new MongoDbImpl();

        ResultSet resultSet = null;
        Connection connection = null;
        PreparedStatement preparedStatement = null;

        String host = "localhost:3306";
        String user = "root";
        String password = "root";
        String database = "users";
        String command = "Select * from users";

        connection = mySql.connectToMysql(host, database, user, password);
        resultSet = mySql.getResultSet(connection, command, preparedStatement);
        mySql.writeResultSet(resultSet);
        mySql.closeConnections(connection, preparedStatement, resultSet);


        host = "root:root@cluster0.1ig2o.mongodb.net/firstDatabase?retryWrites=true&w=majority";
        database = "firstDatabase";
        String collection = "firstCollection";
        MongoDatabase mongoDatabase = null;
        MongoCollection mongoCollection = null;
        mongoDatabase = mongoDb.connectToMongoDb(host, database);
        mongoCollection = mongoDb.getMongoCollection(collection, mongoDatabase);
        String [] keys = {"nick", "postal", "age", "hobby"};
        String [] values = {"Corvin", "85579", "n.a.", "programming"};
        Document document = mongoDb.createMongoDocument(keys, values);
        mongoCollection.insertOne(document);
        mongoDb.getCollectionDocuments(collection, mongoDatabase);
        mongoDb.getDocumentsByKey("name", "firstCollection", mongoDatabase);
        mongoDb.getDocumentsByValue("Corvin", "firstCollection", mongoDatabase);
        mongoDb.getDocumentsByKeyValue("hobby","programming","firstCollection", mongoDatabase);
        }
}



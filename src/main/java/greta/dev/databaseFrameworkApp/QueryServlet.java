package greta.dev.databaseFrameworkApp;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import greta.dev.databaseFrameworkApp.Impl.MongoDbImpl;
import greta.dev.databaseFrameworkApp.Impl.MySqlImpl;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.bson.Document;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.*;
import java.util.Arrays;
import java.util.stream.Collectors;

@WebServlet(name = "QueryServlet", value = "/QueryServlet")
public class QueryServlet extends HttpServlet {
    MongoDb mongoDb;
    MongoDatabase mongoDatabase;
    MongoCollection mongoCollection;
    MySql mySql;
    Connection connection;
    ResultSet resultSet;
    private String mongoHostName;
    private String user;
    private String password;
    private String mongoDatabaseName;
    private String mySqlDatabaseName;
    private String mySqlHostName;
    Document[] documents;
    PreparedStatement preparedStatement;

    public void init() {
        mongoDb = new MongoDbImpl();
        mySql = new MySqlImpl();
        user = "root";
        password = "root";
        mongoDatabaseName = "institut2";
        mongoHostName = user + ":" + password + "@cluster0.1ig2o.mongodb.net/" + mongoDatabaseName + "?retryWrites=true&w=majority";
        mySqlDatabaseName = "inventory";
        mySqlHostName = "localhost:3306";
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/html");
        String payload = "";
        if ("POST".equalsIgnoreCase(request.getMethod()))
        {
            payload = request.getReader().lines().collect(Collectors.joining(System.lineSeparator()));
        }
        switch(payload) {
            case "mitarbeiter":
                mongoDatabase = mongoDb.connectToMongoDb(mongoHostName, mongoDatabaseName);
                mongoCollection = mongoDb.getMongoCollection("employees", mongoDatabase);
                documents = mongoDb.getCollectionDocuments("employees", mongoDatabase);
                writeDocuments(documents, response);
                break;

            case "inventar":
                try {
                    connection = mySql.connectToMysql(mySqlHostName, mySqlDatabaseName, user, password);
                    String command = "SELECT * FROM products";
                    resultSet = mySql.getResultSet(connection, command, preparedStatement);
                    writeSql(resultSet, response);
                } catch (SQLException throwables) {
                    throwables.printStackTrace();
                }
        }
    }

    protected void writeSql(ResultSet resultSet, HttpServletResponse httpServletResponse) throws SQLException, IOException {
        //Response Payload Structure: "sql, columnCount, columnnames, rowData, rowCount
        if (resultSet != null && httpServletResponse != null) {
            String payload = "sql";
            ResultSetMetaData resultSetMetaData = resultSet.getMetaData();
            PrintWriter out = httpServletResponse.getWriter();

            int columnCount = resultSetMetaData.getColumnCount();
            int rowCount = 0;

            payload = payload + ", " + columnCount;

            for (int i = 1; i < columnCount + 1; i++) {
                payload = payload + ", " + resultSetMetaData.getColumnName(i);
                System.out.println(resultSetMetaData.getColumnName(i));
            }

            int columnType = 0;

            while (resultSet.next()) {
                int i = 1; // start at column 1 in every new resultSet
                rowCount++;

                while (i < columnCount + 1) {
                    // columnType switch-case to return the correct data type
                    columnType = resultSetMetaData.getColumnType(i);
                    switch (columnType) {
                        case 4:
                            payload = payload + ", " + resultSet.getInt(i);
                            break;
                        case 1:
                            payload = payload + ", " + resultSet.getString(i);
                            break;

                        default:
                            payload = payload + ", " + resultSet.getString(i);
                            break;
                    }
                    i++;
                }
            }
            payload = payload + ", " + rowCount;
            out.println(payload);
            System.out.println(rowCount);
        }
    }


    protected void writeDocuments(Document [] documents, HttpServletResponse httpServletResponse) throws IOException {
        //Response Payload Structure: "mongoDb, documentCount, {documentLength, keys, values}
        //Method can´t handle Objects in a document
        if (documents != null && httpServletResponse != null) {
            String payload = "mongoDb" + ", " + documents.length;
            PrintWriter out = httpServletResponse.getWriter();
            for (int i = 0; i < documents.length; i++) {
                Document document = documents[i];
                Object[] keys = document.keySet().stream().toArray();
                Object[] values = document.values().toArray();
                //Every Key must have a value!
                payload = payload + ", " + document.size();

                for (int j = 0; j < document.size(); j++) {
                    payload = payload + ", " + keys[j];
                }
                for (int j = 0; j < document.size(); j++) {
                    payload = payload + ", " + values[j];
                }
            }
            out.println(payload);
            System.out.println(payload);
        }
    }
}

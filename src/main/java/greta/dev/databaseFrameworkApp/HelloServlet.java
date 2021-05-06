package greta.dev.databaseFrameworkApp;

import java.io.*;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.stream.Collectors;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import greta.dev.databaseFrameworkApp.Impl.MongoDbImpl;
import greta.dev.databaseFrameworkApp.Impl.MySqlImpl;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.*;
import org.bson.Document;

@WebServlet(name = "helloServlet", value = "/hello-servlet")
public class HelloServlet extends HttpServlet {
    MongoDb mongoDb;
    MongoDatabase mongoDatabase;
    MongoCollection mongoCollection;
    private String url;
    private String user;
    private String password;
    private String database;
    private String collection;
    Document[] documents;

    public void init() {
        mongoDb = new MongoDbImpl();
        user = "root";
        password = "root";
    }


    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("text/html");
        String payload = "";
        if ("POST".equalsIgnoreCase(request.getMethod()))
        {
            payload = request.getReader().lines().collect(Collectors.joining(System.lineSeparator()));
        }
        int indexOfCollectionName = payload.indexOf("collectionName");
        database = payload.substring(14, indexOfCollectionName-1);

        collection = payload.substring(indexOfCollectionName + 16, payload.length());

        url = "root:" + password + "@cluster0.1ig2o.mongodb.net/" + database
                + "?retryWrites=true&w=majority";

        mongoDatabase = mongoDb.connectToMongoDb(url, database);
        mongoCollection = mongoDb.getMongoCollection(collection, mongoDatabase);
        documents = mongoDb.getCollectionDocuments(collection, mongoDatabase);

        PrintWriter out = response.getWriter();
        out.println("<table>");
        for(int i = 0; i< documents.length;i++) {

            out.println("<tr> <th>" + documents[i] + "</th> </tr>");
        }
        out.println("</table>");
    }

    public void destroy() {
    }
}
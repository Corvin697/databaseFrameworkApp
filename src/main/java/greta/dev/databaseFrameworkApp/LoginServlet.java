package greta.dev.databaseFrameworkApp;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import greta.dev.databaseFrameworkApp.Impl.MongoDbImpl;
import greta.dev.databaseFrameworkApp.Impl.MySqlImpl;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.*;
import org.bson.Document;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.stream.Collectors;

@WebServlet(name = "LoginServlet", value = "/LoginServlet")
public class LoginServlet extends HttpServlet {
    MySql mySql;
    Connection connection;
    private String userLogin;
    private String passwordLogin;
    private String host;
    private String database;

    public void init() {
        mySql = new MySqlImpl();
        host = "localhost:3306";
        database = "users";
        userLogin = "root";
        passwordLogin = "root";
    }


    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("text/html");
        String payload = "";
        PreparedStatement preparedStatement = null;
        ResultSet resultSet;
        String command = "";
        String databasePassword = "";
        if ("POST".equalsIgnoreCase(request.getMethod()))
        {
            payload = request.getReader().lines().collect(Collectors.joining(System.lineSeparator()));
        }
        int seperatorIndex = payload.indexOf(" ");
        String userName = payload.substring(0, seperatorIndex);
        String password = payload.substring(seperatorIndex +1, payload.length());

        try {
            System.out.println(host + database + userLogin + passwordLogin);
            connection = mySql.connectToMysql(host, database, userLogin, passwordLogin);
            if(connection != null) {
                command = "SELECT password FROM users WHERE username=\'" + userName + "\'";

                preparedStatement = connection.prepareStatement(command);
                System.out.println(preparedStatement.toString());
                resultSet = preparedStatement.executeQuery();
                while(resultSet.next()) {
                    databasePassword = resultSet.getString(1);
                }
                if (databasePassword.equals(password)) {
                    response.addCookie(new Cookie("loginCookie", RandomString()));
                    PrintWriter out = response.getWriter();
                    out.println("Login successfull!");
                }
                }
        } catch (SQLException throwables) {
            throwables.printStackTrace();
        }



    }

    public void destroy() {
    }

    public String RandomString() {
        final int STRING_LENGTH = 10;
        StringBuffer sb = new StringBuffer();
        for (int i = 0; i < STRING_LENGTH; i++)
        {
            sb.append((char)((int)(Math.random()*26)+97));
        }
        return sb.toString();
    }
}

package greta.dev.databaseFrameworkApp;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.stream.Collectors;

@WebServlet(name = "DashboardServlet", value = "/DashboardServlet")
public class DashboardServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/html");
        String payload = "";
        PreparedStatement preparedStatement = null;
        ResultSet resultSet;
        String command = "";
        String databasePassword = "";
        if ("POST".equalsIgnoreCase(request.getMethod()))
        {

        }

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
}

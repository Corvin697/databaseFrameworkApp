package greta.dev.databaseFrameworkApp;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.bson.Document;

import java.io.IOException;
import java.sql.ResultSet;
import java.sql.SQLException;

public interface ApplicationServlet {
    /**
     *
     */
    void init();

    /**
     *
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException;

    /**
     *
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException;

    void writeSql(ResultSet resultSet, HttpServletResponse httpServletResponse) throws SQLException, IOException;

    void writeDocuments(Document[] documents, HttpServletResponse httpServletResponse) throws IOException;
}

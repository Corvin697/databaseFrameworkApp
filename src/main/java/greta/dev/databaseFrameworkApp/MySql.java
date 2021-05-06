package greta.dev.databaseFrameworkApp;
import java.sql.*;

public interface MySql {

    /**
     * @param host     The MySQL Host to connect to
     * @param database The name of the database to connect to
     * @param user     The user of the database
     * @param password The user password to the database
     * @return the connection
     * @throws SQLException
     * @author Corvin Tank
     */
    Connection connectToMysql(String host, String database, String user, String password) throws SQLException;

    /**
     * @param connection        The connection to the database provided by the method connectToMysql
     * @param command           The SQL-Statement to execute
     * @param preparedStatement The connection statement
     * @return return the resultSet of the SQL-Command
     * @throws SQLException
     * @author Corvin Tank
     */
    ResultSet getResultSet(Connection connection, String command, PreparedStatement preparedStatement);

    /**
     * @param resultSet The resultSet to print
     * @throws SQLException
     * @author Corvin Tank
     */
    void writeResultSet(ResultSet resultSet) throws SQLException;

    /**
     * @param connection        The connection to close
     * @param preparedStatement The statement to close
     * @param resultSet         The resultSet to close
     * @throws SQLException
     * @author Corvin Tank
     */
    void closeConnections(Connection connection, PreparedStatement preparedStatement, ResultSet resultSet) throws SQLException;
}

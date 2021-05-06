package greta.dev.databaseFrameworkApp.Impl;
import greta.dev.databaseFrameworkApp.MySql;

import java.sql.*;

public class MySqlImpl implements MySql {

    @Override
    public Connection connectToMysql(String host, String database, String user, String password) throws SQLException {
        Connection connection = null;
        try {
            String connectionCommand = "jdbc:mysql://" + host + "/" + database + "?user=" + user + "&password=" + password;
            Class.forName("com.mysql.cj.jdbc.Driver");
            connection = DriverManager.getConnection(connectionCommand);

        } catch (Exception ex) {
            System.out.println("Error");
            ex.printStackTrace();
        }
        return connection;
    }

    @Override
    public ResultSet getResultSet(Connection connection, String command, PreparedStatement preparedStatement) {
        ResultSet resultSet = null;
        try {
            if (connection != null) {
                preparedStatement = connection.prepareStatement(command);
                //TODO: Case-Sensitive SQL Queries !?
                if (command.contains("INSERT") || command.contains("UPDATE") || command.contains("DELETE")) {
                    preparedStatement.executeUpdate();
                    resultSet = preparedStatement.getResultSet();
                } else if (command.contains("SELECT") || command.contains("Select") || command.contains("select")) {
                    resultSet = preparedStatement.executeQuery();
                } else {
                    preparedStatement.execute();
                    resultSet = preparedStatement.getResultSet();
                }
            }

        } catch (SQLException ex) {
            ex.printStackTrace();
            System.out.println("Please check your SQL-Statement!");
        }
        return resultSet;
    }

        @Override
    public void writeResultSet(ResultSet resultSet) throws SQLException {
        int columnType = 0;

        ResultSetMetaData resultSetMetaData = resultSet.getMetaData();

        int columns = resultSetMetaData.getColumnCount();

        while (resultSet.next()) {
            int i = 1;
            while (i < columns + 1) {
                // columnType switch-case to return the correct data type
                columnType = resultSetMetaData.getColumnType(i);
                switch (columnType) {
                    case 4:
                        System.out.println(resultSet.getInt(i));
                        break;
                    case 1:
                        System.out.println(resultSet.getString(i));
                        break;

                    default:
                        System.out.println(resultSet.getString(i));
                        break;
                }
                i++;
            }
        }
    }

    @Override
    public void closeConnections(Connection connection, PreparedStatement preparedStatement, ResultSet resultSet) throws SQLException {
        try {
            if (connection != null) {
                connection.close();
            }
            if (preparedStatement != null) {
                preparedStatement.close();
            }
            if (resultSet != null) {
                resultSet.close();
            }
        } catch (SQLException ex) {
            ex.printStackTrace();
        }

    }
}
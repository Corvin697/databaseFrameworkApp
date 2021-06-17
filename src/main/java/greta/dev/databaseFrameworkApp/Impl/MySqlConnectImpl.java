/**
 * Author: Corvin Tank
 * Bachelor Thesis "REALIZATION OF AN INTEGRATIVE DATABASE FRAMEWORK WITH GENERIC OPERATING INTERFACE AS EXAMPLE OF AN INVENTORY DATABASE"
 */

package greta.dev.databaseFrameworkApp.Impl;

import greta.dev.databaseFrameworkApp.MySqlConnect;

import java.sql.*;

public class MySqlConnectImpl implements MySqlConnect {

    @Override
    public Connection connectToMySql(String host, String database, String user, String password) throws SQLException {
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
    public ResultSet getResultSet(Connection connection, String command) {
        PreparedStatement preparedStatement = null;
        ResultSet resultSet = null;
        try {
            if (connection != null) {
                preparedStatement = connection.prepareStatement(command);
                //TODO: Case-Sensitive SQL Queries !?
                if (command.contains("INSERT") || command.contains("UPDATE") || command.contains("DELETE")) {
                    preparedStatement.executeUpdate();
                    resultSet = preparedStatement.getResultSet();
                } else if (command.contains("SELECT") || command.contains("Select") || command.contains("select")) {
                    System.out.println(command);
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

}
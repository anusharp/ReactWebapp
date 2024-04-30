import ballerina/http;
import ballerina/sql;
import ballerinax/mysql;
import ballerinax/mysql.driver as _;

type Holiday record {|
    int id;
    string date;
    string category;
    string description;
|};

type HolidayResponse record {|
    string jsonPayload;
    string statusCode;

|};

service /database on new http:Listener(9091) {
    private final mysql:Client db;

    function init() returns error? {
        // Initiate the mysql client at the start of the service. This will be used
        // throughout the lifetime of the service.
        self.db = check new ("172.17.0.2", "root", "anusha", "Company", 3306);
    }

    resource function get holiday/[string id]() returns Holiday|http:NotFound|error {
        // Execute simple query to fetch record with requested id.
        Holiday|sql:Error result = self.db->queryRow(`SELECT * FROM holiday WHERE id = ${id}`);

        // Check if record is available or not
        if result is sql:NoRowsError {
            return http:NOT_FOUND;
        } else {
            return result;
        }
    }

    resource isolated function post holiday(@http:Payload Holiday hol) returns int|error {
        sql:ParameterizedQuery query = `INSERT INTO holiday(  date, category, description) VALUES (${hol.date}, ${hol.category}, ${hol.description})`;
        sql:ExecutionResult result = check self.db->execute(query);
        int|string? lastInsertId = result.lastInsertId;
        if lastInsertId is int {
            return lastInsertId;
        } else {
            return error("Unable to obtain last insert ID");
        }
    }

    # Description.
    # + return - return value description
    resource isolated function get holidays() returns Holiday[]|error {
        Holiday[] holidays = [];
        stream<Holiday, error?> resultStream = self.db->query(
        `SELECT * FROM holiday`
    );
        check from Holiday holiday in resultStream
            do {
                holidays.push(holiday);
            };
        check resultStream.close();
        return holidays;
    }

    resource isolated function PUT holiday(Holiday hol) returns int|error {
        sql:ExecutionResult result = check self.db->execute(`
        UPDATE holiday SET
            date = ${hol.date}, 
            category = ${hol.category},
            description = ${hol.description}
        WHERE id = ${hol.id}  
    `);
        int|string? lastInsertId = result.affectedRowCount;
        if lastInsertId is int {
            return lastInsertId;
        } else {
            return error("Unable to obtain last insert ID");
        }
    }

resource isolated function DELETE holiday/[string id]() returns int|error {
    sql:ExecutionResult result = check self.db->execute(`
        DELETE FROM holiday WHERE Id = ${id}
    `);
    int? affectedRowCount = result.affectedRowCount;
    if affectedRowCount is int {
        return affectedRowCount;
    } else {
        return error("Unable to obtain the affected row count");
    }
}

}


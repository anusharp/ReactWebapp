

public type Location record {
    int id;
    string name;
    string country;
    string province;
    string description;
};

public type Photos record {
    int id;
    string image;
    int locationId;
    int holidayId;
    string description;
};

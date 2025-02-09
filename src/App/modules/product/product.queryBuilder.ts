import { FilterQuery, Query } from 'mongoose';

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  // search functionality
  search(searchableFields: string[]) {
    // getting search term from query
    const search = this?.query?.search;
    if (search) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map(
          (field) =>
            ({
              [field]: { $regex: search, $options: 'i' },
            }) as FilterQuery<T>,
        ),
      });
    }

    return this;
  }

  // filter the data
  filter() {
    const queryObj = { ...this.query };

    // excluding search, sortBy, sortOrder, and filter fields from query
    const excludeFields = ['search', 'sortBy, sortOrder'];

    excludeFields.forEach((el) => delete queryObj[el]);

    // filter by author if provided in query
    if (queryObj.filter) {
        queryObj.author = queryObj.filter;
        delete queryObj.filter;
    }

    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);

    return this;
  }

  // sorting the data by given value and order
  sort() {
    const sortBy = this?.query?.sortBy as string;
    const sortOrder = this?.query?.sortOrder === "asc" ? "" : "-";
    const sortQuery = `${sortOrder}${sortBy}`;

    this.modelQuery = this.modelQuery.sort(sortQuery);

    return this;
  }
}

export default QueryBuilder;
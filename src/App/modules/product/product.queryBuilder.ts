import { FilterQuery, Query } from "mongoose";

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
              [field]: { $regex: search, $options: "i" },
            } as FilterQuery<T>)
        ),
      });
    }

    return this;
  }

  // filter the data
  filter() {
    const queryObj = { ...this.query };

    // excluding search, sortBy, sortOrder, and filter fields from query
    const excludeFields = ["search", "sortBy", "limit", "page"];

    excludeFields.forEach((el) => delete queryObj[el]);

    // // filter by author if provided in query
    // if (queryObj.filter) {
    //   queryObj.author = queryObj.filter;
    //   delete queryObj.filter;
    // }

    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);

    return this;
  }
  // sorting the data by given value and order
  sort() {
    const sortBy =
      (this?.query?.sortBy as string)?.split(",")?.join(" ") || "name";
    this.modelQuery = this.modelQuery.sort(sortBy as string);

    return this;
  }

  // limit the number of results returned
  limit() {
    const limit = Number(this.query?.limit);
    if (!isNaN(limit) && limit > 4) {
      this.modelQuery = this.modelQuery.limit(limit);
    }
    return this;
  }
  paginate() {
    const page = Number(this?.query?.page) || 1;
    const limit =
      Number(this.query?.limit) >= 4 ? Number(this.query?.limit) : 8;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }
}

export default QueryBuilder;

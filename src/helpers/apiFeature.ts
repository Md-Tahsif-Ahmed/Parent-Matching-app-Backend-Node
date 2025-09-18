class APIFeatures {
  query: any;
  queryString: Record<string, any>;

  constructor(query: any, queryString: Record<string, any>) {
    this.query = query;
    this.queryString = queryString;
  }

  /**  Search on given fields (e.g., partner name) */
  search(searchTarget: string[]) {
    const searchTerm: string | undefined = this.queryString.searchTerm;

    if (searchTerm && searchTerm.trim() !== "") {
      const regex = new RegExp(searchTerm, "i");
      this.query = this.query.find({
        $or: searchTarget.map((field) => ({
          [field]: { $regex: regex, $options: "i" },
        })),
      });
    }

    return this;
  }

  /**  Pagination with total count */
  async pagination(model: any) {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 10;
    const skip = (page - 1) * limit;

    // total count (before pagination)
    const total = await model.countDocuments(this.query.getQuery());
    const totalPages = Math.ceil(total / limit);

    this.query = this.query.skip(skip).limit(limit);

    return {
      total,
      totalPages,
      currentPage: page,
      limit,
    };
  }
}

export default APIFeatures;

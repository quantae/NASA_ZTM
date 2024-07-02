// function for re-usable query

const DEFAULT_PAGE_NUMBER = 1;
const DEFAULT_PAGE_LIMIT = 10;

function getPagination(query) {
  const page = Math.abs(query.page) || DEFAULT_PAGE_NUMBER;
  const limit = Math.abs(query.limit) || DEFAULT_PAGE_LIMIT;
  const skip = (page) * limit;

  return {
    // we return the variables as an object.
    skip: skip,
    limit, // limit is number of items per page
  };
}

module.exports = {
  getPagination,
};

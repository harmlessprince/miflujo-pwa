export const productsTableHeaders = [

  {
    title: "Name",
    accessor: "name",
  },
  {
    title: "Price",
    accessor: "price",
    type: "money",
  },
  {
    title: "Available QTY",
    accessor: "quantityInStock",
  },
  {
    title: "Category",
    accessor: "category",
  },
  {
    title: "Date Added",
    accessor: "date_added",
  },
  {
    title: "Discount",
    accessor: "discount",
  },
  {
    title: "Published",
    accessor: "isArchived",
    type: "boolean",
    booleanLabels: {
      true: "No",
      false: "Yes",
    },
  },
];




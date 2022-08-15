import {
  FilterInterface,
  Filters,
  IndexTable,
  Pagination,
  Select,
  TextStyle,
  useIndexResourceState,
} from "@shopify/polaris";
import { IndexTableHeading } from "@shopify/polaris/dist/types/latest/src/components/IndexTable";
import { NonEmptyArray } from "@shopify/polaris/dist/types/latest/src/types";
import React, { useCallback, useState } from "react";
import {
  IProduct,
  IProductResult,
  IProductVariant,
  IProductVariantResult,
} from "../../api/interfaces";

export const RenderProductCell = (props: {
  index: number;
  cellName: any;
  product: IProductResult;
  firstColumn?: boolean;
}) => {
  const { index, cellName = "title", firstColumn, product } = props;

  if (!product) return <></>;

  const getValue = (data: IProduct | IProductVariant, cellName: string) => {
    if (data) {
      for (const [key, value] of Object.entries(data)) {
        if (key === cellName) {
          return value;
        }
      }
    }
    return "";
  };

  return firstColumn ? (
    <IndexTable.Cell>
      <p key={"firstColumn-" + index} style={{ padding: "2rem 0" }}>
        {getValue(product.node, cellName) || "-"}
      </p>
      {!product.node.hasOnlyDefaultVariant &&
        product.variants.map((variant: IProductVariantResult) => (
          <p
            key={"title-" + variant.node.id}
            style={{ marginLeft: "4rem", padding: "1rem 0" }}
          >
            <TextStyle>{getValue(variant.node, cellName) || "-"}</TextStyle>
          </p>
        ))}
    </IndexTable.Cell>
  ) : (
    <IndexTable.Cell>
      {!product.node.hasOnlyDefaultVariant && (
        <p key={"type-empty-" + index} style={{ padding: "2rem 0" }}>
          {""}
        </p>
      )}
      {product.variants.map((variant) => (
        <p key={"type-" + variant?.node?.id} style={{ padding: "1rem 0" }}>
          <TextStyle variation="subdued">
            {getValue(variant.node, cellName) ||
              getValue(product.node, cellName) ||
              "-"}
          </TextStyle>
        </p>
      ))}
    </IndexTable.Cell>
  );
};

// Editable cell example:

// <IndexTable.Cell>
//    <input
//        style={{ border: 0, background: "none", padding: "1rem" }}
//        id={item.node.id}
//        name="title"
//        value={item.node.title}
//        onChange={(e): void => updateData(e)}
//    />
// </IndexTable.Cell>

// const updateData = (e: React.ChangeEvent<HTMLInputElement>) => {
//   data?.map((row) => {
//     if (row.node.id === e.target.id) {
//       return {
//         ...row,
//         node: {
//           ...row.node,
//           [e.target.name]: e.target.value,
//         },
//       };
//     } else {
//       return row;
//     }
//   });
// };

const DataTable = (
  data: IProductResult[],
  rowMarkup: JSX.Element[],
  headings: NonEmptyArray<IndexTableHeading>,
  loading?: boolean
) => {
  const emptyRecord = [{}];
  const [tableRecord] = useState(emptyRecord);
  const [taggedWith, setTaggedWith] = useState("");
  const [queryValue, setQueryValue] = useState("");
  const [sortValue, setSortValue] = useState("title");
  const resourceName = {
    singular: "product",
    plural: "products",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(tableRecord);

  const disambiguateLabel = (key: string, value: string) => {
    switch (key) {
      case "taggedWith":
        return `Tagged with ${value}`;
      default:
        return value;
    }
  };

  const isEmpty = (value: string | any[] | null) => {
    if (Array.isArray(value)) {
      return value.length === 0;
    } else {
      return value === "" || value == null;
    }
  };

  const handleTaggedWithRemove = useCallback(() => setTaggedWith(""), []);
  const handleQueryValueRemove = useCallback(() => setQueryValue(""), []);
  const handleClearAll = useCallback(() => {
    handleTaggedWithRemove();
    handleQueryValueRemove();
  }, [handleQueryValueRemove, handleTaggedWithRemove]);
  const sortOptions = [
    { label: "Product title", value: "title" },
    { label: "Product type", value: "type" },
    { label: "SKU", value: "sku" },
    { label: "Price", value: "price" },
  ];
  const appliedFilters = !isEmpty(taggedWith)
    ? [
        {
          key: "taggedWith",
          label: disambiguateLabel("taggedWith", taggedWith),
          onRemove: handleTaggedWithRemove,
        },
      ]
    : [];

  const promotedBulkActions = [
    {
      content: "Bulk edit selected products",
      onAction: () => console.log("Todo: implement bulk edit"),
    },
  ];

  const handleSortChange = useCallback((value) => setSortValue(value), []);

  const filters: FilterInterface[] = [];

  return (
    <>
      <div style={{ padding: "1.5rem", display: "flex" }}>
        <div style={{ flex: 1 }}>
          <Filters
            queryValue={queryValue}
            filters={filters}
            appliedFilters={appliedFilters}
            onQueryChange={setQueryValue}
            onQueryClear={handleQueryValueRemove}
            onClearAll={handleClearAll}
          />
        </div>
        <div style={{ paddingLeft: "0.4rem" }}>
          <Select
            labelInline
            label="Sort by"
            options={sortOptions}
            value={sortValue}
            onChange={handleSortChange}
          />
        </div>
      </div>
      <IndexTable
        resourceName={resourceName}
        itemCount={data.length}
        selectedItemsCount={
          allResourcesSelected ? "All" : selectedResources.length
        }
        onSelectionChange={handleSelectionChange}
        promotedBulkActions={promotedBulkActions}
        headings={headings}
        loading={loading}
      >
        {rowMarkup}
      </IndexTable>
      <div style={{ padding: "2rem", display: "flex", alignItems: "center" }}>
        <div style={{ marginLeft: "auto", marginRight: "1.5rem" }}>
          <span>Showing {data.length} products</span>
        </div>
        <Pagination
          hasPrevious
          onPrevious={() => {
            console.log("Previous");
          }}
          hasNext
          onNext={() => {
            console.log("Next");
          }}
        />
      </div>
    </>
  );
};

export default DataTable;

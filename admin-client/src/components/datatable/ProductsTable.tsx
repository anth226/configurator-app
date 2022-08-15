import {
  FilterInterface,
  Filters,
  IndexTable,
  Pagination,
  Select,
  useIndexResourceState,
} from "@shopify/polaris";
import { useCallback, useEffect, useState } from "react";
import { useProducts } from "../../api/api";
import { IProductResult, IProductVariant } from "../../api/interfaces";
import { NonEmptyArray } from "@shopify/polaris/dist/types/latest/src/types";
import { IndexTableHeading } from "@shopify/polaris/dist/types/latest/src/components/IndexTable";
import { RenderProductCell } from "./DataTable";

const ProductsTable = (props: {
  handleSelectionChangeInParent: any;
  limit?: number;
  isCompact?: boolean;
  promotedBulkActions?: {
    content: string;
    onAction: () => void;
  }[];
  isFilter?: boolean;
}) => {
  const {
    handleSelectionChangeInParent,
    promotedBulkActions,
    limit = 10,
    isCompact = false,
    isFilter = false,
  } = props;

  const [pageData, setPageData] = useState<IProductResult[]>();
  const [page, setPage] = useState(1);
  const [processing, setProcessing] = useState(true);
  const [allData, setAllData] = useState<IProductResult[]>();
  const [tableRecord, setTableRecord] = useState([{}]);
  const [taggedWith, setTaggedWith] = useState("");
  const [queryValue, setQueryValue] = useState("");
  const [sortValue, setSortValue] = useState("title");
  const [previousPage, setPreviousPage] = useState<undefined | string>();
  const [nextPage, setNextPage] = useState<undefined | string>();
  const resourceName = {
    singular: "product",
    plural: "products",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(tableRecord);

  const { products, fetchProducts, loading, error } = useProducts(10);

  useEffect(() => {
    if (products) {
      if (!allData) {
        setAllData(products.products);
      } else {
        // add products to all products if page not already included
        if (page * limit > allData.length) {
          products.products.forEach((element) => {
            allData.push(element);
          });
        }
      }
      setPageData(products.products);
      setPreviousPage(products.pageInfo.previousPage);
      setNextPage(products.pageInfo.nextPage);
    }
    setProcessing(false);
  }, [products]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!pageData || pageData.length === 0) {
      return;
    }
    setTableRecord(
      pageData.map((product) => {
        return { id: product.cursor };
      })
    );
  }, [pageData]);

  useEffect(() => {
    if (allData) {
      let selected: IProductVariant[] = [];
      allData.forEach((item) => {
        if (selectedResources.includes(item.cursor)) {
          selected = selected.concat({
            ...item.variants[0]?.node,
            title: item.node.title,
          });
        }
      });
      handleSelectionChangeInParent(selected);
    }
  }, [selectedResources]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    console.error(error);
  }, [error]);

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

  const rowMarkup = pageData?.map((item: IProductResult, index: number) => {
    const renderProps = {
      product: item,
      index,
    };
    return (
      <IndexTable.Row
        id={item.cursor}
        key={"row" + index}
        selected={selectedResources.includes(item.cursor)}
        position={index}
      >
        <RenderProductCell
          {...renderProps}
          cellName={"title"}
          firstColumn={true}
        />
        <RenderProductCell {...renderProps} cellName={"productType"} />
        <RenderProductCell {...renderProps} cellName={"sku"} />
        {!isCompact && (
          <RenderProductCell {...renderProps} cellName={"price"} />
        )}
      </IndexTable.Row>
    );
  });

  const handleTaggedWithRemove = useCallback(() => setTaggedWith(""), []);
  const handleQueryValueRemove = useCallback(() => setQueryValue(""), []);
  const handleClearAll = () => {
    handleTaggedWithRemove();
    handleQueryValueRemove();
  };
  const sortOptions = [
    { label: "Product title", value: "title" },
    { label: "Product type", value: "type" },
    { label: "SKU", value: "sku" },
    { label: "Price", value: "price" },
  ];
  const sortCompactOptions = [
    { label: "Product title", value: "title" },
    { label: "Product type", value: "type" },
    { label: "SKU", value: "sku" },
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

  const handleSortChange = useCallback((value) => setSortValue(value), []);

  const filters: FilterInterface[] = [];

  const headings = [
    { title: "Title" },
    { title: "Type" },
    { title: "SKU" },
    { title: "Price" },
  ] as NonEmptyArray<IndexTableHeading>;

  const headingsCompact = [
    { title: "Title" },
    { title: "Type" },
    { title: "SKU" },
  ] as NonEmptyArray<IndexTableHeading>;

  return (
    <>
      <div style={{ padding: "1.5rem 1rem", display: "flex" }}>
        {isFilter && (
          <>
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
                options={isCompact ? sortCompactOptions : sortOptions}
                value={sortValue}
                onChange={handleSortChange}
              />
            </div>
          </>
        )}
      </div>

      <IndexTable
        resourceName={resourceName}
        itemCount={pageData?.length || 0}
        selectable={true}
        selectedItemsCount={
          allResourcesSelected ? "All" : selectedResources.length
        }
        onSelectionChange={handleSelectionChange}
        promotedBulkActions={promotedBulkActions}
        headings={isCompact ? headingsCompact : headings}
        loading={loading || processing || !pageData || pageData.length === 0}
      >
        {rowMarkup}
      </IndexTable>

      <div style={{ padding: "2rem", display: "flex", alignItems: "center" }}>
        <div style={{ marginLeft: "auto", marginRight: "1.5rem" }}>
          <span>
            Showing {pageData?.length || 0} products (page{" "}
            {processing ? "is loading..." : page})
          </span>
        </div>
        <Pagination
          hasPrevious={!!previousPage && !loading}
          onPrevious={() => {
            if (!loading && !processing) {
              setProcessing(true);
              fetchProducts(limit, previousPage);
              setPage(page - 1);
            }
          }}
          hasNext={!!nextPage && !loading}
          onNext={() => {
            if (!loading && !processing) {
              setProcessing(true);
              fetchProducts(limit, nextPage);
              setPage(page + 1);
            }
          }}
        />
      </div>
    </>
  );
};

export default ProductsTable;

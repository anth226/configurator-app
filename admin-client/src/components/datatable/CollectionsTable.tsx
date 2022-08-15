import {
  FilterInterface,
  Filters,
  IndexTable,
  TextStyle,
  Thumbnail,
  useIndexResourceState,
} from "@shopify/polaris";
import { useCallback, useEffect, useState } from "react";
import { useCollections } from "../../api/api";
import { ICollection, ICollectionResult } from "../../api/interfaces";
import { NonEmptyArray } from "@shopify/polaris/dist/types/latest/src/types";
import { IndexTableHeading } from "@shopify/polaris/dist/types/latest/src/components/IndexTable";

const CollectionsTable = (props: {
  handleSelectionChangeInParent: any;
  limit?: number;
  isCompact?: boolean;
  promotedBulkActions?: {
    content: string;
    onAction: () => void;
  }[];
}) => {
  const {
    handleSelectionChangeInParent,
    promotedBulkActions,
    limit = 10,
    isCompact = false,
  } = props;

  const [pageData, setPageData] = useState<ICollectionResult[]>();
  const [processing, setProcessing] = useState(true);
  const [allData, setAllData] = useState<ICollectionResult[]>();
  const [tableRecord, setTableRecord] = useState([{}]);
  const [taggedWith, setTaggedWith] = useState("");
  const [queryValue, setQueryValue] = useState("");
  // const [sortValue, setSortValue] = useState("title");
  const resourceName = {
    singular: "product",
    plural: "products",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(tableRecord);

  const { collections, fetchCollections, loading, error } = useCollections();

  useEffect(() => {
    if (allData && queryValue === "") {
      setPageData(allData);
    } else {
      if (collections) {
        setPageData(collections.collections);
        if (!allData) {
          setAllData(collections.collections);
        }
      }
    }
    setProcessing(false);
  }, [collections, allData, queryValue]);

  useEffect(() => {
    if (!pageData || pageData.length === 0) {
      return;
    }
    setTableRecord(
      pageData.map((collection) => {
        return { id: collection.node.id };
      })
    );
  }, [pageData]);

  useEffect(() => {
    if (allData && queryValue !== "") {
      fetchCollections({ limit: limit, query: queryValue });
    }
  }, [queryValue, fetchCollections, limit, allData]);

  useEffect(() => {
    if (allData) {
      let selected: ICollection[] = [];
      allData.forEach((item) => {
        if (selectedResources.includes(item.node.id)) {
          selected = selected.concat({
            id: item.node.id,
            title: item.node.title,
          });
        }
      });
      handleSelectionChangeInParent(selected);
    }
  }, [selectedResources, allData]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const rowMarkup = pageData?.map((item: ICollectionResult, index: number) => {
    return (
      <IndexTable.Row
        id={item.node.id}
        key={"row" + index}
        selected={selectedResources.includes(item.node.id)}
        position={index}
      >
        <IndexTable.Cell>
          <div style={{ margin: "0.5rem 0" }}>
            <Thumbnail source={item.node.image?.originalSrc || ""} alt="" />
          </div>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <TextStyle>{item.node.title}</TextStyle>
        </IndexTable.Cell>
      </IndexTable.Row>
    );
  });

  const handleTaggedWithRemove = useCallback(() => setTaggedWith(""), []);
  const handleQueryValueRemove = useCallback(() => setQueryValue(""), []);
  const handleClearAll = () => {
    handleTaggedWithRemove();
    handleQueryValueRemove();
  };
  // const sortOptions = [{ label: "Collection title", value: "title" }];
  // const sortCompactOptions = [{ label: "Collection title", value: "title" }];
  const appliedFilters = !isEmpty(taggedWith)
    ? [
        {
          key: "taggedWith",
          label: disambiguateLabel("taggedWith", taggedWith),
          onRemove: handleTaggedWithRemove,
        },
      ]
    : [];

  // const handleSortChange = useCallback((value) => setSortValue(value), []);

  const filters: FilterInterface[] = [];

  const headings = [
    { title: "" },
    { title: "Title" },
  ] as NonEmptyArray<IndexTableHeading>;

  const headingsCompact = [
    { title: "" },
    { title: "Title" },
  ] as NonEmptyArray<IndexTableHeading>;

  return (
    <>
      <div
        style={{
          padding: "1.5rem 1rem",
          display: "flex",
          marginRight: "-1rem",
        }}
      >
        <div style={{ flex: 1 }}>
          <Filters
            queryValue={queryValue}
            filters={filters}
            appliedFilters={appliedFilters}
            onQueryChange={setQueryValue}
            onQueryClear={handleQueryValueRemove}
            onClearAll={handleClearAll}
            disabled={!allData || allData?.length === 0}
          />
        </div>
        {/* <div style={{ paddingLeft: "0.4rem" }}>
          <Select
            labelInline
            label="Sort by"
            options={isCompact ? sortCompactOptions : sortOptions}
            value={sortValue}
            onChange={handleSortChange}
            disabled={true}
          />
        </div> */}
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
        loading={loading || processing}
      >
        {rowMarkup}
      </IndexTable>

      <div style={{ padding: "1rem", display: "flex", alignItems: "center" }}>
        <div style={{ marginLeft: "auto" }}>
          <span>
            Showing {pageData?.length || 0} of {allData?.length || 0}{" "}
            collections
          </span>
        </div>
      </div>
    </>
  );
};

export default CollectionsTable;

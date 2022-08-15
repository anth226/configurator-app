import { Card, Page } from "@shopify/polaris";
import ProductsTable from "../components/datatable/ProductsTable";

const ProductsView = () => {
  const promotedBulkActions = [
    {
      content: "Bulk edit selected products",
      onAction: () => console.log("Todo: implement bulk edit"),
    },
  ];

  const handleSelectionChange = (items: any) => {
    // TODO
  };

  return (
    <Page
      key="Products"
      fullWidth
      title="Shopify products"
      primaryAction={{
        content: "+ Import Shopify products",
        onAction: () => {},
      }}
    >
      <Card>
        <ProductsTable
          limit={10}
          handleSelectionChangeInParent={handleSelectionChange}
          promotedBulkActions={promotedBulkActions}
        />
      </Card>
    </Page>
  );
};

export default ProductsView;

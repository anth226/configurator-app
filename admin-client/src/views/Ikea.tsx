import { Card, Page } from "@shopify/polaris";

const IkeaView = () => {
  return (
    <Page
      key="Ikea"
      fullWidth
      title="Ikea products"
      primaryAction={{
        content: "+ Add Ikea products",
        onAction: () => {},
      }}
    >
      <Card>
        <div style={{ padding: "1.5rem", display: "flex" }}>
          <h1>todo</h1>
        </div>
      </Card>
    </Page>
  );
};

export default IkeaView;

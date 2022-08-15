import {
  Banner,
  Button,
  Card,
  Page,
  Stack,
  TextStyle,
  Image,
} from "@shopify/polaris";
import { useHistory } from "react-router-dom";
import LogoH from "../images/ashelsingö.png";
import LogoS from "../images/shopify.png";

const DashBoardView = () => {
  const history = useHistory();
  return (
    <Page key="DashBoardView" fullWidth title="Welcome to Configurator App">
      <Stack vertical>
        <Card>
          <Card.Section>
            <div
              style={{
                display: "flex",
                flexFlow: "row",
                gap: "4rem 8rem",
                flexWrap: "wrap",
              }}
            >
              <div style={{ maxWidth: "55rem", minWidth: "30rem" }}>
                <Stack vertical>
                  <TextStyle variation="strong">
                    Manage your product configurations
                  </TextStyle>
                  <p>
                    With the product configurator you can create and manage
                    product configurations for your Shopify store.
                  </p>
                  <p>
                    Define the selections which will be visible for your
                    customers by creating sections and options. Define also the
                    logic behind the selections: What selections affect the
                    amount of products in the configuration and what products
                    should be excluded from the configuration when specific
                    option is selected.
                  </p>
                  <p>
                    First take care that you have all the configuration parts in
                    your Shopify products and they are in their own collections.
                    Product data might need to be enriched with additional
                    fields.
                  </p>
                </Stack>
              </div>
              <div
                style={{
                  display: "flex",
                  flexFlow: "column",
                  gap: "5rem",
                  maxWidth: "30rem",
                  paddingRight: "8rem",
                  margin: "3rem 0",
                  justifyContent: "center",
                }}
              >
                <Image source={LogoH} alt="" />
                <Image source={LogoS} alt="" />
              </div>
            </div>
            <div
              style={{
                marginTop: "3rem",
              }}
            >
              <Button primary onClick={() => history.push("/configurations/")}>
                Manage configurations
              </Button>
            </div>
          </Card.Section>
        </Card>
        <Banner status="warning">
          The analytics of received configuration orders will be soon linked
          here.
        </Banner>
      </Stack>
    </Page>
  );
};

export default DashBoardView;

import {
  AppProvider,
  Banner,
  Button,
  Frame,
  Navigation,
} from "@shopify/polaris";
import { HomeMajor, PackageMajor } from "@shopify/polaris-icons";
import enTranslations from "@shopify/polaris/locales/en.json";
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { authenticate } from "./api/api";
import { useAuthToken } from "./context/AuthContext";
import useQueryParams from "./hooks/useQueryParams";
import Routes from "./routes";
import classes from "./css/layout.module.css";

const App = () => {
  const queryParams = useQueryParams();
  const { token, setToken } = useAuthToken();
  const { code } = queryParams;
  const [error, setError] = useState<string>("");
  const location = useLocation();

  const navItem = [
    {
      url: "/",
      label: "Home",
      icon: HomeMajor,
      selected: location.pathname === "/",
    },
    // {
    //   url: "/products",
    //   label: "Shopify products",
    //   icon: ProductsMajor,
    //   selected: location.pathname === "/products",
    // },
    {
      url: "/configurations",
      label: "Configurations",
      icon: PackageMajor,
      selected: location.pathname.startsWith("/configurations"),
    },
    // {
    //   url: "/ikea",
    //   label: "Ikea products",
    //   icon: AddProductMajor,
    //   selected: location.pathname === "/ikea",
    // },
  ];

  const navigation = (
    <Navigation location="/">
      <Navigation.Section fill items={navItem} />
    </Navigation>
  );

  const auth = useCallback(async () => {
    setError("");
    try {
      const data = await authenticate(queryParams);
      if (data !== "nok" && data.token) {
        setToken(data.token);
      } else if (data.error || data.message) {
        data.error ? setError(data.error) : setError(data.message);
      } else {
        setError(data);
      }
    } catch (e) {
      console.error(e);
    }
  }, [queryParams, setToken]);

  useEffect(() => {
    if (queryParams && !token && !error) {
      auth();
    }
  }, [code, queryParams, token, auth, error]);

  useEffect(() => {
    console.info(error);
  }, [error]);

  return (
    <AppProvider
      i18n={enTranslations}
      linkComponent={(props: any) => (
        <Link className={props.className} to={props.url || ""}>
          {props.children}
        </Link>
      )}
    >
      <div>
        {error ? (
          <div style={{ padding: "1rem" }}>
            <Banner title="Configuration App loading failed" status="critical">
              {error}
              <div style={{ marginTop: "1rem" }}>
                <Button onClick={() => auth()}>Try again</Button>
              </div>
            </Banner>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "nowrap",
            }}
          >
            <div className={classes.navigation}>{navigation}</div>
            <div className={classes.content}>
              <Frame>
                <Routes />
              </Frame>
            </div>
          </div>
        )}
      </div>
    </AppProvider>
  );
};

export default App;

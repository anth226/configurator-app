import {
  Card,
  Page,
  Button,
  Popover,
  ActionList,
  Thumbnail,
  DataTable,
  Filters,
  Layout,
  FilterInterface,
  Banner,
  SkeletonBodyText,
  Stack,
} from "@shopify/polaris";
import {
  DeleteMinor,
  // DuplicateMinor,
  EditMinor,
  NoteMajor,
  MobileVerticalDotsMajor,
  DuplicateMinor,
} from "@shopify/polaris-icons";
import { useHistory } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { useConfigurations } from "../../api/api";
import { IConfiguration } from "../../api/interfaces";
import ConfirmationModal from "../../components/confirmation/confirmationModal";

const ConfigurationsView = () => {
  const history = useHistory();
  const [data, setData] = useState<IConfiguration[]>();
  const [active, setActive] = useState<string>("");
  const toggleActive = (rowID: string) => {
    setActive(active !== "" && active === rowID ? "" : rowID);
  };
  const {
    configurations,
    deleteConfiguration,
    duplicateConfiguration,
    loading,
    error,
  } = useConfigurations({});

  const [taggedWith, setTaggedWith] = useState("");
  const [queryValue, setQueryValue] = useState("");

  const filters: FilterInterface[] = [];

  const [confirmationItem, setConfirmationItem] = useState({
    id: "",
    name: "",
  });

  const isEmpty = (value: string | any[] | null) => {
    if (Array.isArray(value)) {
      return value.length === 0;
    } else {
      return value === "" || value == null;
    }
  };

  const disambiguateLabel = (key: string, value: string) => {
    switch (key) {
      case "taggedWith":
        return `Tagged with ${value}`;
      default:
        return value;
    }
  };

  const handleTaggedWithRemove = useCallback(() => setTaggedWith(""), []);
  const handleQueryValueRemove = useCallback(() => setQueryValue(""), []);
  const handleClearAll = () => {
    handleTaggedWithRemove();
    handleQueryValueRemove();
  };

  const appliedFilters = !isEmpty(taggedWith)
    ? [
        {
          key: "taggedWith",
          label: disambiguateLabel("taggedWith", taggedWith),
          onRemove: handleTaggedWithRemove,
        },
      ]
    : [];

  useEffect(() => {
    setData(configurations);
  }, [configurations]);

  const handleNew = () => {
    history.push({
      pathname: "/configurations/new",
      state: {},
    });
  };

  const handleDelete = (id: string) => {
    deleteConfiguration(id);
    setConfirmationItem({ id: "", name: "" });
  };

  const dublicateCallback = (id: string) => {
    if (id) {
      history.push("/"); // This is needed to router to notice push below
      history.push("/configurations/" + id);
    }
  };

  const handleDuplicate = (id: string) => {
    duplicateConfiguration(dublicateCallback, id);
  };

  const activator = (item: string) => (
    <Button
      icon={MobileVerticalDotsMajor}
      plain
      onClick={() => toggleActive(item)}
    />
  );

  const getThumbnail = (src: string) =>
    `${process.env.REACT_APP_API_HOST}images/${src}?size=thumbnail`;

  const rowMarkup = data
    ? data
        .filter((item) =>
          item?.name?.toUpperCase().includes(queryValue.toUpperCase())
        )
        .map((item: IConfiguration, index: number) => {
          const meta = item.meta || "";
          return [
            <div
              style={{ cursor: "pointer" }}
              onClick={() => history.push("/configurations/" + meta)}
            >
              <Thumbnail
                key={"image" + index}
                source={(item.photo && getThumbnail(item.photo)) || NoteMajor}
                alt="Configuration image"
              />
            </div>,
            <div
              style={{ height: "6rem", padding: "2rem 0", cursor: "pointer" }}
              onClick={() => history.push("/configurations/" + meta)}
            >
              {item.name || "-"}
            </div>,
            <div
              style={{
                height: "6rem",
                padding: "2rem 0",
                cursor: "pointer",
              }}
              onClick={() => history.push("/configurations/" + meta)}
            >
              {item.productType || "-"}
            </div>,
            <div
              style={{ height: "6rem", padding: "2rem 0", cursor: "pointer" }}
              onClick={() => history.push("/configurations/" + meta)}
            >
              {item.created || "-"}
            </div>,
            <Popover
              key={meta}
              active={active === meta}
              activator={activator(meta)}
              onClose={() => toggleActive(meta)}
            >
              <ActionList
                items={[
                  {
                    content: "Edit",
                    icon: EditMinor,
                    onAction: () =>
                      history.push({
                        pathname: "/configurations/" + meta,
                        state: {
                          initialName: item.name,
                          initialImageId: item.photo,
                        },
                      }),
                  },
                  {
                    content: "Duplicate",
                    icon: DuplicateMinor,
                    onAction: () => handleDuplicate(meta),
                  },
                  {
                    content: "Delete",
                    icon: DeleteMinor,
                    disabled: !item.done,
                    onAction: () =>
                      setConfirmationItem({
                        id: meta,
                        name: item.name ? item.name : "",
                      }),
                  },
                ]}
              />
            </Popover>,
          ];
        })
    : [["", "", "", "", "", ""]];

  return (
    <>
      <Page
        key="Configurations"
        fullWidth
        title="Configurations"
        primaryAction={{
          content: "+ Create new configuration",
          onAction: handleNew,
          disabled: loading || !data,
        }}
      >
        <Layout>
          {error ? (
            <Layout.Section>
              <Banner title="Error" status="critical">
                {error}
              </Banner>
            </Layout.Section>
          ) : (
            <Layout.Section>
              <Banner status="info" title="Create configurations">
                Create different configurations of your Shopify products by
                combining them in different ways. Give a name for the
                configuration, define what kind of sections you want to show in
                the configurator and what kind of options you want to give your
                users. Lastly, define what kind of configuration specific
                actions each option triggers.
              </Banner>
            </Layout.Section>
          )}
          <Layout.Section>
            {loading || !data ? (
              <Card sectioned>
                <Card.Section>
                  <SkeletonBodyText />
                  <SkeletonBodyText />
                </Card.Section>
                <Card.Section>
                  <SkeletonBodyText />
                </Card.Section>
                <Card.Section>
                  <SkeletonBodyText />
                </Card.Section>
                <Card.Section>
                  <SkeletonBodyText />
                </Card.Section>
              </Card>
            ) : (
              <Stack vertical>
                <Card>
                  <Card.Section>
                    <div style={{ marginRight: "-1rem" }}>
                      <Filters
                        queryValue={queryValue}
                        filters={filters}
                        appliedFilters={appliedFilters}
                        onQueryChange={setQueryValue}
                        onQueryClear={handleQueryValueRemove}
                        onClearAll={handleClearAll}
                        disabled={!data || data?.length === 0}
                      />
                    </div>
                  </Card.Section>

                  <DataTable
                    columnContentTypes={[
                      "text",
                      "text",
                      "text",
                      "text",
                      "numeric",
                    ]}
                    headings={[
                      "",
                      "Configuration",
                      "Product type",
                      "Created",
                      "",
                    ]}
                    rows={rowMarkup}
                    verticalAlign={"middle"}
                  />

                  <Card.Section>
                    <div
                      style={{
                        padding: "1rem 0 0 0",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ marginLeft: "auto" }}>
                        Showing {rowMarkup?.length || 0} of {data?.length || 0}{" "}
                        configurations
                      </div>
                    </div>
                  </Card.Section>
                </Card>
              </Stack>
            )}
          </Layout.Section>
        </Layout>
      </Page>
      <ConfirmationModal
        active={!!confirmationItem.id}
        yesCallback={() => handleDelete(confirmationItem.id)}
        cancelCallback={() => setConfirmationItem({ id: "", name: "" })}
        itemType="configuration"
        itemName={confirmationItem.name}
        type="delete"
      />
    </>
  );
};

export default ConfigurationsView;

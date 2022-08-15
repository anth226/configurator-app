import {
  Button,
  Page,
  Stack,
  Layout,
  Card,
  ActionList,
  Popover,
  Tooltip,
  Label,
  Image,
  Banner,
} from "@shopify/polaris";
import {
  CircleTickOutlineMinor,
  CircleDisableMinor,
} from "@shopify/polaris-icons";
import { OptionDescriptor } from "@shopify/polaris/dist/types/latest/src/components/OptionList";
import { useCallback, useEffect, useState } from "react";
import { useOptions } from "../../../api/api";
import { IAction, IProduct } from "../../../api/interfaces";
import Loading from "../../../components/loading/Loading";
import ActionCountProducts from "./CountProducts";
import ActionFilterProducts from "./FilterProducts";
import ConfirmationModal from "../../../components/confirmation/confirmationModal";

type PropsType = {
  activityCallback: Function;
  meta: string;
  configurationName: string;
  configurationImage: string;
  sectionId: string;
  sectionName: string;
  sectionImage: string;
  optionId: string;
  optionName: string;
  optionImage: string;
  actions: IAction[];
  products: IProduct[];
};

const EditActions = (props: PropsType) => {
  const {
    activityCallback,
    meta,
    configurationName,
    configurationImage,
    sectionId,
    sectionName,
    sectionImage,
    optionId,
    optionName,
    optionImage,
    actions,
    products,
  } = props;

  const [actionList, setActionList] = useState<IAction[]>(actions);
  const [confirmationActive, setConfirmationActive] = useState(false);
  const [anyChanges, setAnyChanges] = useState(false);
  const [active, setActive] = useState(false);
  const [optImage, setOptionImage] = useState<string>("");
  const [sectImage, setSectionImage] = useState<string>("");
  const [configImage, setConfigurationImage] = useState<string>("");
  const toggleActive = useCallback(() => setActive((active) => !active), []);

  const [productTypeOptions, setProductTypeOptions] = useState<
    OptionDescriptor[] | []
  >([]);

  useEffect(() => {
    const items = [
      ...new Set(
        products.map((product) => {
          return product.productType;
        }) || []
      ),
    ];
    setProductTypeOptions(
      items.map((item) => {
        return { label: item, value: item };
      })
    );
  }, [products]);

  const getThumbnail = (src: string) =>
    `${process.env.REACT_APP_API_HOST}images/${src}?size=medium`;

  useEffect(() => {
    if (configurationImage) {
      setConfigurationImage(getThumbnail(configurationImage));
    }
    if (sectionImage) {
      setSectionImage(getThumbnail(sectionImage));
    }
    if (optionImage) {
      setOptionImage(getThumbnail(optionImage));
    }
  }, [configurationImage, sectionImage, optionImage]);

  const { updateOption, error, loading } = useOptions({
    meta: meta,
    sectionId: sectionId,
    callback: () => setAnyChanges(false),
  });

  useEffect(() => {
    console.error(error);
  }, [error]);

  const goBack = () => {
    activityCallback();
  };

  const handleSave = () => {
    updateOption(optionId, {
      sectionId: sectionId,
      actions: actionList,
    });
    // when finishes, set no changes
  };

  const updateActionList = (props: {
    id: string;
    productType: string;
    productFeatures?: string[];
    count?: string;
  }) => {
    const listItem = actionList.map((item) => {
      if (item.id === props.id) {
        if (props.productType || props.productType === "") {
          if (!anyChanges) {
            setAnyChanges(item.filteredProductType !== props.productType);
          }
          item.filteredProductType = props.productType;
        }
        if (props.count || props.count === "") {
          if (!anyChanges) {
            setAnyChanges(item.count !== props.count);
          }
          item.count = props.count;
        }
        if (props.productFeatures) {
          if (!anyChanges) {
            setAnyChanges(
              item.filteredProductFeatures !== props.productFeatures
            );
          }
          item.filteredProductFeatures = props.productFeatures;
        }
      }
      return item;
    });
    setActionList(listItem);
  };

  const filters =
    actionList && actionList.length > 0 ? (
      actionList.map((action, index) => {
        switch (action.type) {
          case "filter": {
            return (
              <Card.Section
                key={action.id + "-" + index}
                title={
                  <div style={{ display: "flex" }}>
                    <Tooltip
                      content={
                        <p>
                          Only these parts will be selected from this product
                          type.{" "}
                          <i>
                            Notice: Do not add this if all parts are needed for
                            your configuration (the default).
                          </i>
                        </p>
                      }
                      dismissOnMouseOut
                      preferredPosition="below"
                    >
                      <div style={{ display: "flex", cursor: "help" }}>
                        <div
                          style={{
                            width: "1.8rem",
                            marginRight: "1rem",
                          }}
                        >
                          <CircleTickOutlineMinor />
                        </div>

                        <Label id="labelFilterProducts">
                          Include only selected parts
                        </Label>
                      </div>
                    </Tooltip>
                  </div>
                }
                subdued={index % 2 === 1}
                actions={[
                  // { content: "Duplicate" },
                  {
                    content: "Delete",
                    destructive: true,
                    onAction: () => {
                      setAnyChanges(true);
                      setActionList(
                        actionList.filter((item) => {
                          return item.id !== action.id;
                        })
                      );
                    },
                  },
                ]}
              >
                <Stack vertical>
                  <ActionFilterProducts
                    filterId={action.id}
                    products={products}
                    productTypes={productTypeOptions}
                    updateActionList={updateActionList}
                    initialType={action.filteredProductType}
                    initialFeatures={action.filteredProductFeatures}
                  />
                </Stack>
              </Card.Section>
            );
          }
          case "discard": {
            return (
              <Card.Section
                key={action.id + "-" + index}
                title={
                  <div style={{ display: "flex" }}>
                    <Tooltip
                      content={
                        <p>
                          Select all but these parts from this product type.{" "}
                          <i>
                            Notice: Do not add this if all parts are needed for
                            your configuration (the default).
                          </i>
                        </p>
                      }
                      dismissOnMouseOut
                      preferredPosition="below"
                    >
                      <div style={{ display: "flex", cursor: "help" }}>
                        <div
                          style={{
                            width: "1.8rem",
                            marginRight: "1rem",
                          }}
                        >
                          <CircleDisableMinor />
                        </div>
                        <Label id="labelDiscardProducts">
                          Discard selected parts (include all others)
                        </Label>
                      </div>
                    </Tooltip>
                  </div>
                }
                subdued={index % 2 === 1}
                actions={[
                  // { content: "Duplicate" },
                  {
                    content: "Delete",
                    destructive: true,
                    onAction: () => {
                      setAnyChanges(true);
                      setActionList(
                        actionList.filter((item) => {
                          return item.id !== action.id;
                        })
                      );
                    },
                  },
                ]}
              >
                <Stack vertical>
                  <ActionFilterProducts
                    filterId={action.id}
                    discard={true}
                    products={products}
                    productTypes={productTypeOptions}
                    updateActionList={updateActionList}
                    initialType={action.filteredProductType}
                    initialFeatures={action.filteredProductFeatures}
                  />
                </Stack>
              </Card.Section>
            );
          }
          case "count": {
            return (
              <Card.Section
                key={action.id + "-" + index}
                title={
                  <div style={{ display: "flex" }}>
                    <Tooltip
                      content={
                        <p>
                          Determine how many pieces of this product type should
                          be selected.{" "}
                          <i>
                            Notice: Do not add this if only one part of this
                            type is needed for your configuration (the default).
                          </i>
                        </p>
                      }
                      dismissOnMouseOut
                      preferredPosition="below"
                    >
                      <div style={{ display: "flex", cursor: "help" }}>
                        <span
                          style={{
                            fontSize: "1rem",
                            margin: "0 1rem 0 0",
                          }}
                        >
                          123
                        </span>
                        <Label id="labelCountProducts">
                          Count of parts (if more than one)
                        </Label>
                      </div>
                    </Tooltip>
                  </div>
                }
                subdued={index % 2 === 1}
                actions={[
                  // { content: "Duplicate" },
                  {
                    content: "Delete",
                    destructive: true,
                    onAction: () => {
                      setAnyChanges(true);
                      setActionList(
                        actionList.filter((item) => {
                          return item.id !== action.id;
                        })
                      );
                    },
                  },
                ]}
              >
                <Stack vertical>
                  <ActionCountProducts
                    filterId={action.id}
                    productTypes={productTypeOptions}
                    updateActionList={updateActionList}
                    initialType={action.filteredProductType}
                    initialPCSValue={action.count}
                  />
                </Stack>
              </Card.Section>
            );
          }
          default: {
            return <></>;
          }
        }
      })
    ) : (
      <Card.Section>
        <Banner title="All parts are now included" status="info">
          Actions allow you to include and exclude parts as well as manage the
          amount of parts.
        </Banner>
      </Card.Section>
    );

  return (
    <>
      <Page
        key="Actions"
        fullWidth
        breadcrumbs={[
          {
            content: optionName,
            onAction: () => {
              if (anyChanges) {
                setConfirmationActive(true);
              } else {
                goBack();
              }
            },
          },
        ]}
        title={"Edit actions for " + optionName}
        primaryAction={{
          content: "Save",
          onAction: handleSave,
          disabled: loading || !anyChanges,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => {
              if (anyChanges) {
                setConfirmationActive(true);
              } else {
                goBack();
              }
            },
            disabled: loading,
          },
        ]}
      >
        {loading ? (
          <div
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "20rem",
            }}
          >
            <Loading text="Saving actions..." />
          </div>
        ) : (
          <Layout>
            {error && (
              <Layout.Section>
                <Banner title="Error" status="critical">
                  {error}
                </Banner>
              </Layout.Section>
            )}
            <Layout.Section>
              <Card>
                <Card.Header title="Actions">
                  <Popover
                    active={active}
                    onClose={toggleActive}
                    activator={
                      <Button onClick={toggleActive} disclosure plain>
                        Add action
                      </Button>
                    }
                  >
                    <ActionList
                      items={[
                        {
                          content: "Include only selected",
                          onAction: () => {
                            let list = actionList || [];
                            list.push({
                              id:
                                "action" +
                                Math.floor(Math.random() * 1000) *
                                  Math.floor(Math.random() * 1000),
                              type: "filter",
                            });
                            setActionList(list);
                            toggleActive();
                          },
                        },
                        {
                          content: "Discard selected",
                          onAction: () => {
                            let list = actionList || [];
                            list.push({
                              id:
                                "action" +
                                Math.floor(Math.random() * 1000) *
                                  Math.floor(Math.random() * 1000),
                              type: "discard",
                            });
                            setActionList(list);
                            toggleActive();
                          },
                        },
                        {
                          content: "Count of parts",
                          onAction: () => {
                            let list = actionList || [];
                            list.push({
                              id:
                                "action" +
                                Math.floor(Math.random() * 1000) *
                                  Math.floor(Math.random() * 1000),
                              type: "count",
                            });
                            setActionList(list);
                            toggleActive();
                          },
                        },
                      ]}
                    />
                  </Popover>
                </Card.Header>
                <div style={{ marginTop: "1rem" }}>{filters}</div>
              </Card>
            </Layout.Section>
            <Layout.Section secondary>
              <Card title="Featured in">
                <Card.Section title="Option">
                  <Stack vertical>
                    <span>{optionName}</span>
                    {optImage && (
                      <div
                        style={{
                          width: "125px",
                          height: "125px",
                          border: "1px solid #cccc",
                          borderRadius: "0.8rem",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          overflow: "hidden",
                          background: "white",
                          backgroundImage: optImage,
                        }}
                      >
                        <Image
                          source={optImage}
                          alt={"Configuration image"}
                          width="100%"
                        />
                      </div>
                    )}
                  </Stack>
                </Card.Section>
                <Card.Section title="Section">
                  <Stack vertical>
                    <span>{sectionName}</span>
                    {sectImage && (
                      <div
                        style={{
                          width: "125px",
                          height: "125px",
                          border: "1px solid #cccc",
                          borderRadius: "0.8rem",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          overflow: "hidden",
                        }}
                      >
                        <Image
                          source={sectImage}
                          alt={"Configuration image"}
                          width="100%"
                        />
                      </div>
                    )}
                  </Stack>
                </Card.Section>
                <Card.Section title="Configuration">
                  <Stack vertical>
                    <span>{configurationName}</span>
                    {configImage && (
                      <div
                        style={{
                          width: "125px",
                          height: "125px",
                          border: "1px solid #cccc",
                          borderRadius: "0.8rem",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          overflow: "hidden",
                        }}
                      >
                        <Image
                          source={configImage}
                          alt={"Configuration image"}
                          width="100%"
                        />
                      </div>
                    )}
                  </Stack>
                </Card.Section>
              </Card>
            </Layout.Section>
          </Layout>
        )}
      </Page>
      <ConfirmationModal
        active={confirmationActive}
        noCallback={() => goBack()}
        cancelCallback={() => setConfirmationActive(false)}
      />
    </>
  );
};

export default EditActions;

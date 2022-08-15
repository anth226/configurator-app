import {
  Card,
  Page,
  TextField,
  Layout,
  ResourceList,
  ResourceItem,
  TextStyle,
  DropZone,
  Stack,
  Button,
  Banner,
  Tooltip,
  Icon,
} from "@shopify/polaris";
import { CircleInformationMajor } from "@shopify/polaris-icons";
import { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useConfigurations, useImages } from "../../api/api";
import { ICollection } from "../../api/interfaces";
import CollectionsTable from "../../components/datatable/CollectionsTable";
import ImageUpload from "../../components/imageUpload";
import Loading from "../../components/loading/Loading";
import ConfirmationModal from "../../components/confirmation/confirmationModal";

type PropsType = {
  detailsCallback?: Function;
  configurationMeta?: string;
  initialName?: string;
  initialImageId?: string;
  initialBundleProductId?: string;
  initialSayduckId?: string;
  initialProductType?: string;
  initialSavedConfigurationId?: string;
};

const CreateConfigurationView = (props: PropsType) => {
  const {
    detailsCallback = () => {},
    configurationMeta,
    initialName = "",
    initialImageId,
    initialBundleProductId,
    initialSayduckId,
    initialProductType,
    initialSavedConfigurationId,
  } = props;
  const [confirmationActive, setConfirmationActive] = useState(false);
  const [anyChanges, setAnyChanges] = useState(false);
  const [data, setData] = useState<ICollection[]>();
  const [configName, setConfigName] = useState<string>(initialName || "");
  const [bundleProductId, setBundleProductId] = useState<string>(
    initialBundleProductId || ""
  );
  const [sayduckId, setSayduckId] = useState<string>(initialSayduckId || "");
  const [productType, setProductType] = useState<string>(
    initialProductType || ""
  );
  const [savedConfigurationId, setSavedConfigurationId] = useState<string>(
    initialSavedConfigurationId || ""
  );
  const [meta, setMeta] = useState<string>(configurationMeta || "");
  const [file, setFile] = useState<File>();
  const [configurationImage, setConfigurationImage] = useState<
    string | undefined
  >("");

  const history = useHistory();

  const goBack = () => {
    if (configurationMeta) {
      detailsCallback();
    } else {
      history.push("/configurations");
    }
  };

  const conigurationCallback = async (configData: any) => {
    if (configData && configData.meta) {
      if (!meta) {
        setMeta(configData.meta);
      }
      if (file) {
        uploadImage(meta || configData.meta, file);
      } else {
        if (meta) {
          (error === "" || error === "Ok") && setAnyChanges(false);
        } else {
          history.push("/configurations/" + configData.meta);
        }
      }
    }
  };

  const {
    getConfiguration,
    newConfiguration,
    updateConfiguration,
    loading,
    error,
  } = useConfigurations({
    callback: conigurationCallback,
  });
  const [isLoading, setIsLoading] = useState<boolean>(loading);

  const handleSave = async () => {
    if (configName) {
      setIsLoading(true);
      if (configurationMeta) {
        // Edit configuration details
        if (data) {
          if (configurationImage) {
            await updateConfiguration({
              meta: meta,
              payload: {
                name: configName,
                bundleProductId: bundleProductId,
                productType: productType,
                savedConfigurationId: savedConfigurationId,
                sayduckProductId: sayduckId,
                collections: data.map((element) => {
                  return { id: element.id };
                }),
              },
            });
          } else {
            await updateConfiguration({
              meta: meta,
              payload: {
                name: configName,
                bundleProductId: bundleProductId,
                productType: productType,
                savedConfigurationId: savedConfigurationId,
                sayduckProductId: sayduckId,
                collections: data.map((element) => {
                  return { id: element.id };
                }),
                photo: "", // remove image
              },
            });
          }
        } else {
          if (configurationImage) {
            await updateConfiguration({
              meta: meta,
              payload: {
                name: configName,
                bundleProductId: bundleProductId,
                productType: productType,
                savedConfigurationId: savedConfigurationId,
                sayduckProductId: sayduckId,
              },
            });
          } else {
            await updateConfiguration({
              meta: meta,
              payload: {
                name: configName,
                bundleProductId: bundleProductId,
                productType: productType,
                savedConfigurationId: savedConfigurationId,
                sayduckProductId: sayduckId,
                photo: "", // remove image
              },
            });
          }
        }
        if (file) {
          await uploadImage(meta, file);
        } else {
          await getConfiguration({ id: meta }); // To make sure data is actual, refactor this?
        }
        (error === "" || error === "Ok") && setAnyChanges(false);
      } else if (data) {
        // New configuration
        await newConfiguration({
          payload: {
            name: configName,
            bundleProductId: bundleProductId,
            productType: productType,
            sayduckProductId: sayduckId,
            collections: data.map((element) => {
              return { id: element.id };
            }),
          },
        });
      } else {
        await newConfiguration({
          payload: {
            name: configName,
          },
        });
      }
    }
  };

  useEffect(() => {
    if (initialImageId) {
      setConfigurationImage(getOptionThumbnail(initialImageId));
    }
  }, [initialImageId]);

  const handleSelectionChange = (items: any) => {
    items.length > 0 ? setAnyChanges(true) : setAnyChanges(false);
    setData(items);
  };

  const handleNameChange = (value: string) => {
    value === initialName ? setAnyChanges(false) : setAnyChanges(true);
    setConfigName(value);
  };

  const handleBundleProductId = (value: string) => {
    value === initialBundleProductId
      ? setAnyChanges(false)
      : setAnyChanges(true);
    setBundleProductId(value);
  };

  const handleSayduckId = (value: string) => {
    value === initialSayduckId ? setAnyChanges(false) : setAnyChanges(true);
    setSayduckId(value);
  };

  const handleProductType = (value: string) => {
    value === initialProductType ? setAnyChanges(false) : setAnyChanges(true);
    setProductType(value);
  };

  const handlSavedConfigurationId = (value: string) => {
    value === initialSavedConfigurationId
      ? setAnyChanges(false)
      : setAnyChanges(true);
    setSavedConfigurationId(value);
  };

  const uploadCallback = async (meta: string, fileUrl: string) => {
    await updateConfiguration({
      meta: meta,
      payload: {
        photo: fileUrl,
      },
    });
    await getConfiguration({ id: meta }); // To make sure data is actual, refactor this?
    if (configurationMeta) {
      detailsCallback();
    } else {
      history.push("/configurations/" + meta);
    }
  };
  const { uploadImage, loadingImages } = useImages({
    meta: meta,
    callback: uploadCallback,
  });

  useEffect(() => {
    setIsLoading(loading || loadingImages);
  }, [loading, loadingImages]);

  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) => {
      setFile(() => acceptedFiles[0]);
      setAnyChanges(true);
    },
    []
  );

  const getOptionThumbnail = (src: string) =>
    `${process.env.REACT_APP_API_HOST}images/${src}?size=original`;

  useEffect(() => {
    getConfiguration({ id: meta });
  }, [meta]); // eslint-disable-line react-hooks/exhaustive-deps

  return isLoading && !error ? (
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100vh",
      }}
    >
      <Loading text="Saving configuration..." />
    </div>
  ) : (
    <>
      <Page
        key="Create_modify_configuration"
        fullWidth
        title={
          configurationMeta ? "Edit configuration" : "Create new configuration"
        }
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => {
              if (anyChanges && configName && configName !== "") {
                setConfirmationActive(true);
              } else {
                goBack();
              }
            },
          },
        ]}
        primaryAction={{
          content: configurationMeta ? "Save" : "Next",
          onAction: handleSave,
          disabled:
            !anyChanges ||
            !configName ||
            configName === "" ||
            (!configurationMeta && data?.length === 0),
        }}
        breadcrumbs={[
          {
            content: "Configurations",
            onAction: () => {
              if (anyChanges && configName && configName !== "") {
                setConfirmationActive(true);
              } else {
                goBack();
              }
            },
          },
        ]}
      >
        <Layout>
          {error && (
            <Layout.Section>
              <Banner title="Error" status="critical">
                {error}
              </Banner>
            </Layout.Section>
          )}
          <Layout.Section>
            {configurationMeta && (
              <Card title="Name">
                <Card.Section>
                  <div style={{ maxWidth: "40rem" }}>
                    <TextField
                      autoFocus={configName === ""}
                      label="Configuration name"
                      id="name"
                      value={configName}
                      onChange={handleNameChange}
                      error={anyChanges && configName === ""}
                    />
                  </div>
                </Card.Section>
              </Card>
            )}

            {configurationMeta ? (
              <Card title={"Product data"} sectioned>
                You can not add or remove collections after making a
                configuration.
              </Card>
            ) : (
              <Card title="Product data">
                <Card.Section>
                  <p>
                    Select all possible configuration parts choosing at least
                    one collection.
                  </p>
                  <br />
                  <p>
                    You can not add or remove collections later but you can
                    refresh the chosen collection if you update the product data
                    within the collection.
                  </p>
                  <div style={{ margin: "0 -1rem -1rem" }}>
                    <CollectionsTable
                      limit={50}
                      isCompact
                      handleSelectionChangeInParent={handleSelectionChange}
                    />
                  </div>
                </Card.Section>
              </Card>
            )}
          </Layout.Section>

          <Layout.Section secondary>
            {!configurationMeta && (
              <Card title="Name">
                <Card.Section>
                  <div style={{ maxWidth: "40rem" }}>
                    <TextField
                      autoFocus
                      label="Configuration name"
                      id="name"
                      value={configName}
                      onChange={handleNameChange}
                      error={
                        anyChanges &&
                        configName !== initialName &&
                        configName === ""
                      }
                    />
                  </div>
                </Card.Section>
              </Card>
            )}
            <Card subdued>
              <Card.Header title="Image (optional)">
                <Tooltip content="Configuration image is optional but it will help you in defining further details of the configuration and managing created configurations. This image will not be visible for customers at the online store.">
                  <Icon source={CircleInformationMajor} />
                </Tooltip>
              </Card.Header>
              <Card.Section>
                <Stack vertical>
                  <Stack.Item>
                    <DropZone allowMultiple={false} onDrop={handleDropZoneDrop}>
                      <ImageUpload
                        file={file}
                        initialImage={configurationImage}
                      />
                    </DropZone>
                  </Stack.Item>
                  {(file || configurationImage) && (
                    <Stack.Item>
                      <Button
                        plain
                        destructive
                        onClick={() => {
                          setFile(undefined);
                          setConfigurationImage(undefined);
                        }}
                      >
                        Remove image
                      </Button>
                    </Stack.Item>
                  )}
                </Stack>
              </Card.Section>
            </Card>
            {!configurationMeta && (
              <Card
                title={"Selected collections: " + (data?.length || 0)}
                sectioned
              >
                {data && data.length > 0 ? (
                  <ResourceList
                    items={data}
                    renderItem={(item) => {
                      const { id, title } = item;
                      return (
                        <ResourceItem
                          id={"item" + id}
                          url={""}
                          accessibilityLabel={`View details for ${title}`}
                        >
                          <TextStyle variation="strong">{title}</TextStyle>
                        </ResourceItem>
                      );
                    }}
                  />
                ) : (
                  <i>No parts selected</i>
                )}
              </Card>
            )}
            <Card title="Settings" subdued>
              <Card.Section>
                <div style={{ maxWidth: "40rem" }}>
                  <TextField
                    autoFocus={!!configurationMeta && !savedConfigurationId}
                    label="Shopify bundle product id"
                    id="bundleProductId"
                    value={bundleProductId}
                    onChange={handleBundleProductId}
                  />
                </div>
              </Card.Section>
              <Card.Section>
                <div style={{ maxWidth: "40rem" }}>
                  <TextField
                    autoFocus={
                      !!configurationMeta && !!bundleProductId && !productType
                    }
                    label="Product type"
                    id="sauduckId"
                    value={productType}
                    onChange={handleProductType}
                  />
                </div>
              </Card.Section>
              <Card.Section>
                <div style={{ maxWidth: "40rem" }}>
                  <TextField
                    autoFocus={
                      !!configurationMeta &&
                      !!bundleProductId &&
                      !!productType &&
                      !sayduckId
                    }
                    label="Sayduck Id"
                    id="sauduckId"
                    value={sayduckId}
                    onChange={handleSayduckId}
                  />
                </div>
              </Card.Section>
              {configurationMeta && (
                <Card.Section>
                  <div style={{ maxWidth: "40rem" }}>
                    <TextField
                      autoFocus={
                        configName === "" &&
                        !!bundleProductId &&
                        !!productType &&
                        !!sayduckId &&
                        !savedConfigurationId
                      }
                      label="Default saved configuration (from store app)"
                      id="savedConfigurationId"
                      value={savedConfigurationId}
                      onChange={handlSavedConfigurationId}
                    />
                  </div>
                </Card.Section>
              )}
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
      <ConfirmationModal
        active={confirmationActive}
        noCallback={() => goBack()}
        cancelCallback={() => setConfirmationActive(false)}
      />
    </>
  );
};

export default CreateConfigurationView;

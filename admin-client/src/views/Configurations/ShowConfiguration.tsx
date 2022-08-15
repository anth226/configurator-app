import {
  Card,
  Page,
  Thumbnail,
  Layout,
  ResourceItem,
  TextStyle,
  Button,
  Stack,
  Icon,
  Banner,
  Tooltip,
  Spinner,
  SkeletonBodyText,
  SkeletonThumbnail,
  SkeletonDisplayText,
  TextContainer,
  Badge,
} from "@shopify/polaris";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  ClockMajor,
  NoteMajor,
  DragHandleMinor,
  CircleCancelMinor,
} from "@shopify/polaris-icons";
import { useCallback, useEffect, useState } from "react";
import { RouteComponentProps, useHistory, withRouter } from "react-router-dom";
import {
  useConfigurations,
  useImages,
  useSections,
  useOptions,
} from "../../api/api";
import {
  IAction,
  IConfiguration,
  IOption,
  ISection,
} from "../../api/interfaces";
import EditSectionModal from "./Modals/EditSection";
import EditOptionModal from "./Modals/EditOption";
import EditActions from "./Actions/EditActions";
import CreateConfigurationView from "./CreateConfiguration";
import classes from "../../css/layout.module.css";
import ConfirmationModal from "../../components/confirmation/confirmationModal";

type PropsType = RouteComponentProps<{
  meta: string;
}>;

const ShowConfigurationView = (props: PropsType) => {
  const { meta } = props.match.params;
  const {
    configuration,
    tagsConfiguration,
    getConfiguration,
    updateConfiguration,
    deleteConfiguration,
    duplicateConfiguration,
    syncConfiguration,
    loading,
    loadingTags,
    error,
  } = useConfigurations({
    meta: meta,
  });
  const [data, setData] = useState<IConfiguration>();
  const [configWithTags, setConfigWithTags] = useState<IConfiguration>();
  const [tagsLoaded, setTagsLoaded] = useState<boolean>(false);
  const [optionsData, setOptionData] = useState<IOption[]>();
  const [selectedOption, setSelectedOption] = useState<IOption>();
  const [image, setImage] = useState<string>();
  const [selectedSection, setSelectedSection] = useState<string>();
  const [selectedSectionOrder, setSelectedSectionOrder] = useState<string[]>();
  const [selectedSectionName, setSelectedSectionName] = useState<string>();
  const [selectedSectionImage, setSelectedSectionImage] = useState<string>();
  const [editActionsActive, setEditActionsActive] = useState<boolean>(false);
  const [editDetailsActive, setEditDetailsActive] = useState<boolean>(false);
  const [updatingOptions, setUpdatingOptions] = useState<boolean>(true);
  const [confirmationShow, setConfirmationShow] = useState(false);
  const [sayduckOptions, setSayduckOptions] = useState<[]>([]);

  const { updateSection, errorUpdateSection } = useSections({
    meta: meta,
    callback: () => updateData(),
  });

  const sayduckCallback = (sayduckOptions: []) => {
    setSayduckOptions(sayduckOptions);
  };

  const { getSayduckOptions } = useOptions({
    meta: meta,
  });

  const handleShowImage = (meta: string, imageFile: string) => {
    setImage(imageFile);
  };
  const { getThumbnail } = useImages({ meta: meta, callback: handleShowImage });

  const getOptionThumbnail = (src: string) =>
    `${process.env.REACT_APP_API_HOST}images/${src}?size=thumbnail`;

  const findOptions = (data: IConfiguration) => {
    return (
      selectedSection &&
      data.sections?.find((item) => item.id === selectedSection)
    );
  };

  const getTags = useCallback(async () => {
    if (!loadingTags && (!configuration?.done || !configWithTags?.done)) {
      await getConfiguration({ id: meta, tags: true });
    }
  }, [loadingTags, configuration, configWithTags, getConfiguration, meta]);

  useEffect(() => {
    setUpdatingOptions(true);
    if (configuration) {
      setData(configuration);
      let optionsData = findOptions(configuration);
      optionsData && setOptionData(optionsData.options);
      if (configuration?.photo) {
        getThumbnail({ photoSrc: configuration.photo, size: "medium" });
      }
      if (
        !selectedSection &&
        configuration.sections &&
        configuration.sections.length > 0
      ) {
        setSelectedSection(configuration.sections[0].id);
        setSelectedSectionOrder(configuration.sections[0].optionOrder);
        setSelectedSectionName(configuration.sections[0].name);
        setSelectedSectionImage(configuration.sections[0].photo);
      } else {
        if (configuration.sections) {
          let optionsData = findOptions(configuration);
          optionsData && setOptionData(optionsData.options);
          const section = configuration.sections.find(
            (x) => x.id === selectedSection
          );
          setSelectedSectionName(section?.name);
          setSelectedSectionImage(section?.photo);
          setSelectedSectionOrder(section?.optionOrder);
        }
      }
      if (configuration.done) {
        setConfigWithTags(configuration);
        setTagsLoaded(true);
      } else if (!tagsLoaded && !loadingTags) {
        getTags();
      }
      setUpdatingOptions(false);
    }
  }, [configuration]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    getSayduckOptions({
      productId: data?.sayduckProductId,
      sayduckCallback: sayduckCallback,
    });
  }, [data?.sayduckProductId]);

  const updateData = async () => {
    setUpdatingOptions(true);
    await getConfiguration({ id: meta });
  };

  const editActionsCallback = () => {
    setEditActionsActive(false);
    getConfiguration({ id: meta });
  };

  const editDetailsCallback = () => {
    setEditDetailsActive(false);
    getConfiguration({ id: meta });
  };

  useEffect(() => {
    if (data && data.sections) {
      let optionsData = findOptions(data);
      optionsData && setOptionData(optionsData.options);
    }
  }, [selectedSection]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (tagsConfiguration) {
      if (configuration?.done || tagsConfiguration?.done) {
        configuration?.done
          ? setConfigWithTags(configuration)
          : setConfigWithTags(tagsConfiguration);
        setTagsLoaded(true);
      } else {
        const timeout = setTimeout(() => {
          console.info("Trying again to load with products...");
          getTags();
        }, 3000);
        return () => clearTimeout(timeout);
      }
    }
  }, [tagsConfiguration]); // eslint-disable-line react-hooks/exhaustive-deps

  const SectionListItem = (props: {
    id: string;
    index: number;
    title: string;
    sayduckId?: string;
    photo?: string;
    options?: IOption[];
    optionOrder?: string[];
  }) => {
    const { id, index, title, photo, options, optionOrder } = props;

    return (
      <Draggable draggableId={"draggableSection" + id} index={index}>
        {(provided, snapshot) => {
          return (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              style={
                snapshot.isDragging
                  ? { background: "white", ...provided.draggableProps.style }
                  : selectedSection === id
                  ? {
                      backgroundColor: "#EDEEEF",
                      borderRadius: "4px",
                    }
                  : { color: "initial" }
              }
              className={classes.sectionList}
            >
              <ResourceItem
                id={"item" + id}
                key={"item" + id}
                accessibilityLabel={title}
                onClick={() => {
                  setSelectedSection(id);
                  setSelectedSectionName(title);
                  setSelectedSectionImage(photo);
                  setSelectedSectionOrder(optionOrder);
                  setOptionData(options);
                }}
              >
                <div {...provided.dragHandleProps}>
                  <Stack alignment="center" distribution="equalSpacing">
                    <TextStyle
                      variation={
                        (selectedSection === id && "positive") || undefined
                      }
                    >
                      <div
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "155px",
                          textAlign: "center",
                        }}
                      >
                        {title}
                      </div>
                    </TextStyle>
                    <Stack alignment="center">
                      <EditSectionModal
                        meta={meta}
                        sectionId={selectedSection}
                        initialName={selectedSectionName}
                        initialImageId={photo}
                        callback={updateData}
                        hidden={selectedSection !== id}
                        disabled={!tagsLoaded}
                      />
                      <Tooltip content="Drag to reorder sections">
                        <Icon source={DragHandleMinor} color="subdued" />
                      </Tooltip>
                    </Stack>
                  </Stack>
                </div>
              </ResourceItem>
            </div>
          );
        }}
      </Draggable>
    );
  };

  useEffect(() => {
    setUpdatingOptions(false);
  }, [errorUpdateSection]);

  const history = useHistory();

  const dublicateCallback = (id: string) => {
    if (id) {
      history.push("/"); // This is needed to router to notice push below
      history.push("/configurations/" + id);
    }
  };

  const handleDuplicate = () => {
    duplicateConfiguration(dublicateCallback);
  };

  const handleSync = () => {
    syncConfiguration(dublicateCallback);
  };

  const handleDelete = async () => {
    await deleteConfiguration(meta);
    await getConfiguration({});
    setConfirmationShow(false);
    history.push("/configurations");
  };

  const OptionListItem = (props: {
    id?: string;
    index: number;
    name?: string;
    actions?: IAction[];
    photo?: string;
    initialSayduckIds?: { [key: string]: string[] };
  }) => {
    const {
      id = "0",
      index,
      name = "",
      photo = "",
      actions = [],
      initialSayduckIds,
    } = props;

    if (updatingOptions || id === "0") {
      return (
        <div
          id={"item" + index}
          key={"item" + index}
          style={{ padding: "1.2rem 2rem", borderBottom: "1px solid #eee" }}
        >
          <Stack alignment="center" distribution="equalSpacing">
            <Stack alignment="center">
              <SkeletonThumbnail />
              <div
                style={{
                  minWidth: "20rem",
                }}
              >
                <SkeletonBodyText />
              </div>
            </Stack>
            <div
              style={{
                display: "flex",
                width: "100%",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexFlow: "column",
                  alignItems: "flex-start",
                  minWidth: "25rem",
                }}
              >
                <div style={{ minWidth: "25rem" }}>
                  <SkeletonBodyText />
                </div>
              </div>
              <div
                style={{
                  marginLeft: "3rem",
                  whiteSpace: "nowrap",
                }}
              >
                <div style={{ minWidth: "7rem", marginRight: "2rem" }}>
                  <SkeletonBodyText />
                </div>
              </div>
              <div style={{ minWidth: "3rem" }}>
                <SkeletonDisplayText size="medium" />
              </div>
            </div>
          </Stack>
        </div>
      );
    }

    return (
      <Draggable draggableId={"draggableOption" + id} index={index}>
        {(provided, snapshot) => {
          return (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              style={
                snapshot.isDragging
                  ? { background: "white", ...provided.draggableProps.style }
                  : provided.draggableProps.style
              }
              className={classes.optionList}
            >
              <ResourceItem
                id={"item" + id}
                key={"item" + id}
                accessibilityLabel={name}
                onClick={() => {}}
              >
                <div {...provided.dragHandleProps}>
                  <Stack alignment="center" distribution="equalSpacing">
                    <Stack alignment="center">
                      <Thumbnail
                        source={
                          (photo && getOptionThumbnail(photo)) || NoteMajor
                        }
                        alt=""
                      />
                      <div
                        style={{
                          minWidth: "20rem",
                        }}
                      >
                        <TextStyle>{name}</TextStyle>
                      </div>
                    </Stack>
                    <Stack>
                      <div
                        style={{
                          display: "flex",
                          flexFlow: "column",
                          alignItems: "flex-start",
                          minWidth: "25rem",
                        }}
                      >
                        {actions?.length > 0 ? (
                          <span>
                            Subset of parts is included ({actions?.length}{" "}
                            actions)
                          </span>
                        ) : (
                          !updatingOptions &&
                          id !== "0" && (
                            <span>All parts are included (0 actions)</span>
                          )
                        )}
                        {tagsLoaded ? (
                          <Button
                            plain
                            onClick={() => {
                              setSelectedOption({
                                id: id,
                                name: name,
                                photo: photo,
                                actions: actions,
                              });
                              setEditActionsActive(true);
                            }}
                          >
                            {actions?.length > 0
                              ? "Edit actions"
                              : "Add new actions"}
                          </Button>
                        ) : (
                          <Tooltip
                            content={
                              <Stack>
                                <TextStyle variation="strong">
                                  Actions are not yet editable
                                </TextStyle>
                                <span>
                                  Please wait while preparing the product
                                  data...
                                </span>
                                <Spinner size="small" />
                              </Stack>
                            }
                            dismissOnMouseOut
                          >
                            <TextStyle variation="subdued">
                              Edit actions
                            </TextStyle>{" "}
                          </Tooltip>
                        )}
                      </div>
                      <div
                        style={{
                          marginLeft: "3rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {selectedSection && (
                          <EditOptionModal
                            meta={meta}
                            sectionId={selectedSection}
                            optionId={id}
                            sectionName={selectedSection}
                            initialName={name}
                            initialImageId={photo}
                            callback={updateData}
                            sayduckOptions={sayduckOptions}
                            initialSayduckIds={initialSayduckIds}
                            disabled={!tagsLoaded}
                          />
                        )}
                      </div>
                      <div style={{ marginLeft: "2rem" }}>
                        <Tooltip content="Drag to reorder sections">
                          <Icon source={DragHandleMinor} color="subdued" />
                        </Tooltip>
                      </div>
                    </Stack>
                  </Stack>
                </div>
              </ResourceItem>
            </div>
          );
        }}
      </Draggable>
    );
  };

  const sortSections = (items: ISection[] | undefined): ISection[] => {
    let result: ISection[] = [];
    if (data && data.sectionOrder && items) {
      data.sectionOrder.forEach((key) => {
        var found = false;
        items = items?.filter((item) => {
          if (!found && item.id === key) {
            result.push(item);
            found = true;
            return false;
          } else return true;
        });
      });
    }
    return result;
  };

  const sortOptions = (items: IOption[] | undefined): IOption[] => {
    let result: IOption[] = [];
    if (selectedSection && selectedSectionOrder && items) {
      selectedSectionOrder.forEach((key) => {
        var found = false;
        items = items?.filter((item) => {
          if (!found && item.id === key) {
            result.push(item);
            found = true;
            return false;
          } else return true;
        });
      });
    }
    return result;
  };

  const SectionList = () => {
    const [items, setItems] = useState<ISection[]>(
      sortSections(data?.sections)
    );

    const handleDragEnd = useCallback(({ source, destination }) => {
      setItems((oldItems: ISection[]) => {
        const newItems = oldItems.slice();
        const [temp] = newItems?.splice(source.index, 1) || [];
        newItems?.splice(destination.index, 0, temp);
        if (selectedSection) {
          updateConfiguration({
            meta: meta,
            payload: {
              sectionOrder: newItems.map((item) => item.id),
            },
            reload: false,
          });
        }
        return newItems;
      });
    }, []);

    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="root">
          {(provided) => {
            return (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {items &&
                  items.map((item, index) => (
                    <SectionListItem
                      key={item.id}
                      id={item.id}
                      index={index}
                      title={item.name || "-"}
                      options={item.options}
                      optionOrder={item.optionOrder}
                      photo={item.photo}
                    />
                  ))}
                {provided.placeholder}
              </div>
            );
          }}
        </Droppable>
      </DragDropContext>
    );
  };

  const OptionsList = (props: { empty?: number }) => {
    const { empty } = props;
    const [items, setItems] = useState<IOption[]>(sortOptions(optionsData));

    const handleDragEnd = useCallback(({ source, destination }) => {
      setItems((oldItems: IOption[]) => {
        setUpdatingOptions(true);
        const newItems = oldItems.slice();
        const [temp] = newItems?.splice(source.index, 1) || [];
        newItems?.splice(destination.index, 0, temp);
        if (selectedSection) {
          updateSection({
            id: selectedSection,
            payload: {
              optionOrder: newItems.map((item) => item.id),
            },
          });
        }
        return newItems;
      });
    }, []);

    return (
      <div style={{ position: "relative" }}>
        {errorUpdateSection !== "" && errorUpdateSection !== "Ok" ? (
          <div
            style={{
              position: "absolute",
              top: "2rem",
              left: "40%",
              display: "flex",
            }}
          >
            <Icon source={CircleCancelMinor} />
            <span style={{ marginLeft: "0.5rem" }}>Error occured!</span>
          </div>
        ) : (
          <div
            style={
              errorUpdateSection !== "" && errorUpdateSection
                ? { opacity: "0" }
                : {}
            }
          >
            {empty ? (
              <div
                style={{
                  margin: "0 -2rem",
                  borderTop: "1px solid #E1E3E5",
                }}
              >
                {empty === 1 && (
                  <>
                    <OptionListItem index={1} />
                  </>
                )}
                {empty && empty > 1 && (
                  <>
                    <OptionListItem index={1} />
                    <OptionListItem index={2} />
                    <OptionListItem index={3} />
                  </>
                )}
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="root">
                  {(provided) => {
                    return (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{
                          margin: "0 -2rem",
                          borderTop: "1px solid #E1E3E5",
                        }}
                      >
                        {items &&
                          items.map((item, index) => (
                            <OptionListItem
                              key={item.id}
                              id={item.id}
                              index={index}
                              name={item.name || "-"}
                              photo={item.photo}
                              actions={item.actions}
                              initialSayduckIds={item.sayduckIds}
                            />
                          ))}
                        {provided.placeholder}
                      </div>
                    );
                  }}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        )}
      </div>
    );
  };

  const subtitleConsist =
    configWithTags?.products &&
    "Consists of " + configWithTags?.products?.length + " products";

  const subtitleProductType =
    configuration?.productType !== "" && configuration?.productType;

  return (
    <>
      {editDetailsActive && (
        <CreateConfigurationView
          detailsCallback={editDetailsCallback}
          configurationMeta={meta}
          initialName={data?.name}
          initialImageId={data?.photo}
          initialBundleProductId={data?.bundleProductId}
          initialProductType={data?.productType}
          initialSayduckId={data?.sayduckProductId}
          initialSavedConfigurationId={data?.savedConfigurationId}
        />
      )}
      {editActionsActive && (
        <EditActions
          activityCallback={editActionsCallback}
          meta={meta || ""}
          configurationName={data?.name || ""}
          sectionId={selectedSection || ""}
          sectionName={selectedSectionName || ""}
          optionId={selectedOption?.id || ""}
          optionName={selectedOption?.name || ""}
          configurationImage={data?.photo || ""}
          sectionImage={selectedSectionImage || ""}
          optionImage={selectedOption?.photo || ""}
          actions={selectedOption?.actions || []}
          products={configWithTags?.products || []}
        />
      )}
      {!editDetailsActive && !editActionsActive && (
        <Page
          key="Show configuration"
          fullWidth
          title={(data && data?.name) || "-"}
          subtitle={
            (subtitleConsist
              ? subtitleConsist + (subtitleProductType ? " | " : "")
              : "") + (subtitleProductType ? subtitleProductType : "")
          }
          breadcrumbs={[{ content: "Configurations", url: "/configurations" }]}
          titleMetadata={
            data?.name?.endsWith("copy") && (
              <Badge status="info">Duplicate</Badge>
            )
          }
          thumbnail={
            image ? (
              <Thumbnail source={image} alt="" />
            ) : (
              <Thumbnail source={NoteMajor} alt="No configuration image" />
            )
          }
          secondaryActions={[
            {
              content: "Sync",
              accessibilityLabel: "Sync configuration",
              onAction: () => handleSync(),
              disabled: loading || !tagsLoaded || !data?.collections?.length,
            },
            {
              content: "Duplicate",
              accessibilityLabel: "Duplicate configuration",
              onAction: () => handleDuplicate(),
              disabled: loading,
            },
            {
              content: "Delete",
              accessibilityLabel: "Delete configuration",
              onAction: () => setConfirmationShow(true),
              disabled: loading || !tagsLoaded,
            },
            {
              content: "Edit details",
              accessibilityLabel: "Edit configuration details",
              onAction: () => setEditDetailsActive(true),
            },
          ]}
        >
          {loading ? (
            <Layout>
              <Layout.Section>
                <Card sectioned>
                  <TextContainer>
                    <SkeletonDisplayText size="small" />
                    <SkeletonBodyText />
                  </TextContainer>
                </Card>
                <Card sectioned>
                  <TextContainer>
                    <SkeletonDisplayText size="small" />
                    <SkeletonBodyText />
                  </TextContainer>
                </Card>
              </Layout.Section>
            </Layout>
          ) : (
            <Layout>
              <Layout.Section fullWidth>
                {error && error !== "Ok" && (
                  <Banner title="Error" status="critical">
                    {error}
                  </Banner>
                )}
                {tagsLoaded && !error ? (
                  <Banner status="info" title="How to build a configuration">
                    Build the store UI for the configuration by creating
                    <ul>
                      <li>
                        <b>Sections</b> will make the menu of the configuration
                      </li>
                      <li>
                        <b>Options</b> will be visible for the user under in
                        each section
                      </li>
                    </ul>
                    After this step you can define the logic behind each option
                    by creating
                    <ul>
                      <li>
                        <b>Actions</b> allow you to include and exclude parts as
                        well as manage the amount of parts
                      </li>
                    </ul>
                  </Banner>
                ) : (
                  !error && (
                    <Banner
                      title="Syncing the product data..."
                      icon={ClockMajor}
                      status="warning"
                    >
                      Build the store UI for the configuration by creating
                      <ul>
                        <li>
                          <b>Sections</b> will make the menu of the
                          configuration
                        </li>
                        <li>
                          <b>Options</b> will be visible for the user under in
                          each section
                        </li>
                      </ul>
                      Section, options and actions are not editable now. You can
                      add actions and sections or edit configuration details.
                      <ul>
                        <li>
                          <b>Actions</b> allow you to include and exclude parts
                          as well as manage the amount of parts
                        </li>
                      </ul>
                    </Banner>
                  )
                )}
              </Layout.Section>
              <Layout.Section fullWidth>
                <Card>
                  <div
                    style={{ width: "100%", display: "flex", flexFlow: "row" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexFlow: "column",
                        minWidth: "calc(250px + 2rem)",
                        minHeight: "36rem",
                      }}
                    >
                      <h2
                        className="Polaris-Heading"
                        style={{
                          marginBottom: "1.5rem",
                          display: "flex",
                          flexFlow: "row",
                          width: "100%",
                          justifyContent: "space-between",
                          alignContent: "center",
                          padding: "2rem 0 0 2rem",
                        }}
                      >
                        <span>Sections</span>
                        <div
                          style={{
                            marginRight: "2rem",
                          }}
                        >
                          <EditSectionModal meta={meta} callback={updateData} />
                        </div>
                      </h2>
                      {data && data.sections && data.sections.length > 0 ? (
                        <SectionList />
                      ) : (
                        <div
                          style={{
                            padding: "0 0 2rem 2rem",
                          }}
                        >
                          {configuration ? (
                            <i>No sections</i>
                          ) : (
                            <div style={{ marginRight: "2rem" }}>
                              <SkeletonBodyText />
                              <SkeletonBodyText />
                              <SkeletonBodyText />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexFlow: "column",
                        borderLeft: "1px solid #ccc",
                        padding: "2rem",
                        width: "100%",
                      }}
                    >
                      <h2
                        className="Polaris-Heading"
                        style={{
                          marginBottom: "2rem",
                          display: "flex",
                          flexFlow: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        {selectedSection ? (
                          <span>Options for {selectedSectionName}</span>
                        ) : (
                          <span>Options</span>
                        )}
                        {selectedSection && (
                          <EditOptionModal
                            meta={meta}
                            sectionId={selectedSection}
                            sectionName={selectedSectionName}
                            callback={updateData}
                            sayduckOptions={sayduckOptions}
                          />
                        )}
                      </h2>
                      {optionsData && optionsData.length > 0 ? (
                        <OptionsList />
                      ) : configuration ? (
                        updatingOptions ? (
                          <OptionsList empty={1} />
                        ) : (
                          <i>No options in selected section</i>
                        )
                      ) : (
                        <OptionsList empty={3} />
                      )}
                    </div>
                  </div>
                </Card>
              </Layout.Section>
            </Layout>
          )}
        </Page>
      )}
      <ConfirmationModal
        active={confirmationShow}
        yesCallback={() => handleDelete()}
        cancelCallback={() => setConfirmationShow(false)}
        itemType="configuration"
        itemName={data?.name}
        type="delete"
      />
    </>
  );
};

export default withRouter(ShowConfigurationView);

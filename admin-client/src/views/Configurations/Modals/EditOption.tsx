import {
  Button,
  Modal,
  Stack,
  TextField,
  DropZone,
  Banner,
  TextStyle,
  Label,
  OptionList,
} from "@shopify/polaris";
import { OptionDescriptor } from "@shopify/polaris/dist/types/latest/src/components/OptionList";
import { useCallback, useEffect, useState } from "react";
import { useImages, useOptions } from "../../../api/api";
import ConfirmationModal from "../../../components/confirmation/confirmationModal";
import ImageUpload from "../../../components/imageUpload";
import Loading from "../../../components/loading/Loading";
import classes from "../../../css/layout.module.css";

interface SectionDescriptor {
  /** Collection of options within the section */
  options: OptionDescriptor[];
  /** Section title */
  title?: string;
}

const EditOptionModal = (props: {
  meta: string;
  sectionId: string;
  callback: VoidFunction;
  sayduckOptions: [];
  sectionName?: string;
  optionId?: string;
  initialName?: string;
  initialSayduckIds?: { [key: string]: string[] };
  initialImageId?: string;
  disabled?: boolean;
}) => {
  const {
    meta,
    sectionId,
    sectionName,
    optionId,
    initialName = "",
    initialSayduckIds = {},
    initialImageId,
    callback,
    sayduckOptions,
    disabled = false,
  } = props;
  const [active, setActive] = useState<boolean>(false);
  const [optionName, setOptionName] = useState<string>(initialName);
  const [sayDuckOptionMap, setSayDuckOptionMap] = useState<{
    [key: string]: string;
  }>({});
  const [sayduckListOptions, setSayduckListOptions] = useState<
    SectionDescriptor[] | undefined
  >([]);
  const [selectedSayduckOptions, setSelectedSayduckOptions] = useState<
    string[]
  >([]);
  const [file, setFile] = useState<File>();
  const [preview, setPreview] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [anyChanges, setAnyChanges] = useState(false);
  const [anyError, setAnyError] = useState(false);
  const [confirmationShow, setConfirmationShow] = useState(false);

  const { newOption, updateOption, deleteOption, loading, error } = useOptions({
    meta: meta,
    sectionId: sectionId,
    callback: callback,
  });

  useEffect(() => {
    setOptionName(initialName);
  }, [initialName]);

  const uploadCallback = (meta: string, fileUrl: string) => {
    if (optionId) {
      updateOption(optionId, {
        sectionId: sectionId,
        name: optionName,
        sayduckIds: selectedSayduckIds(),
        photo: fileUrl,
      });
    } else {
      newOption({
        name: optionName,
        sayduckIds: selectedSayduckIds(),
        sectionId: sectionId,
        photo: fileUrl,
      });
    }
  };
  const { uploadImage, loadingImages } = useImages({
    meta: meta,
    callback: uploadCallback,
    sectionId: sectionId,
  });

  useEffect(() => {
    setIsLoading(loading || loadingImages);
  }, [loading, loadingImages]);

  const handleClose = () => {
    setActive(!active);
  };

  const getOptionThumbnail = (src: string) =>
    `${process.env.REACT_APP_API_HOST}images/${src}?size=original`;

  const options = useCallback(() => {
    if (sayduckOptions) {
      let sayduckMap: { [key: string]: string } = {};
      const sdOptions = sayduckOptions.map(
        (item: { name: string; uuid: string; liveVariants: { nodes: [] } }) => {
          let options = item?.liveVariants?.nodes?.map(
            (option: {
              name: string;
              uuid: string;
            }): { label: string; value: string; id: string } | undefined => {
              sayduckMap = { ...sayduckMap, [option.uuid]: item.uuid };
              return {
                label: option.name.toLowerCase(),
                value: option.uuid,
                id: item.uuid + ":" + option.uuid,
              };
            }
          ) as OptionDescriptor[];
          return {
            title: options.length > 0 ? item.name : "",
            options: options,
          };
        }
      ) as SectionDescriptor[];
      setSayDuckOptionMap(sayduckMap);
      return sdOptions;
    } else {
      setSayduckListOptions(undefined);
    }
  }, [sayduckOptions]);

  const handleModalChange = useCallback(() => {
    setAnyChanges(false);
    setAnyError(false);
    if (sayduckListOptions && sayduckListOptions.length === 0)
      setSayduckListOptions(options);
    if (active) {
      setOptionName("");
      setFile(undefined);
      setSelectedSayduckOptions([]);
    } else {
      setOptionName(initialName);
      setSelectedSayduckOptions(Object.values(initialSayduckIds).flat());
      if (initialImageId) setPreview(getOptionThumbnail(initialImageId));
    }
    setActive(!active);
  }, [
    initialName,
    initialImageId,
    initialSayduckIds,
    options,
    sayduckListOptions,
    active,
  ]);

  useEffect(() => {
    if (error === "Ok") {
      handleModalChange();
    } else {
      error !== "" && setAnyError(true);
    }
  }, [error, handleModalChange]);

  const selectedSayduckIds = () => {
    let selected = {};
    selectedSayduckOptions.forEach((sdId) => {
      const key = sayDuckOptionMap[sdId];

      if (key in selected) {
        return false;
      } else {
        let items: string[] = [];
        selectedSayduckOptions.forEach((item) => {
          if (sayDuckOptionMap[item] === key) items.push(item);
        });
        selected = { ...selected, [key]: items };
      }
    });
    return selected;
  };

  const handleSave = async () => {
    setIsLoading(true);
    if (optionId) {
      if (file) {
        await uploadImage(meta, file);
        handleModalChange();
      } else {
        if (!preview) {
          await updateOption(optionId, {
            name: optionName,
            sectionId: sectionId,
            photo: "", // remove image,
            sayduckIds: selectedSayduckIds(),
          });
        } else {
          await updateOption(optionId, {
            name: optionName,
            sectionId: sectionId,
            sayduckIds: selectedSayduckIds(),
          });
        }
      }
    } else if (file) {
      await uploadImage(meta, file);
      setActive(!active);
    } else {
      await newOption({
        name: optionName,
        sectionId: sectionId,
        sayduckIds: selectedSayduckIds(),
      });
    }
  };

  const handleDelete = async () => {
    setConfirmationShow(false);
    optionId && (await deleteOption(optionId));
  };

  const activator = (
    <Button
      id="addOption"
      plain
      onClick={handleModalChange}
      disabled={disabled}
    >
      {optionId ? "Edit option" : "Add option"}
    </Button>
  );

  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) => {
      setFile(() => acceptedFiles[0]);
      setAnyChanges(true);
    },
    []
  );

  const SayduckOptionSelection = () => {
    return (
      <div className={classes.optionListSayduck}>
        <OptionList
          sections={sayduckListOptions}
          id={"list"}
          onChange={(selected) => {
            setAnyChanges(true);
            setSelectedSayduckOptions(selected);
          }}
          selected={selectedSayduckOptions}
          allowMultiple
        />
      </div>
    );
  };

  return (
    <>
      <Modal
        activator={activator}
        open={active}
        onClose={handleClose}
        title={
          optionId
            ? "Edit option " + optionName
            : "Add option for " + sectionName
        }
        primaryAction={{
          content: "Save",
          onAction: handleSave,
          disabled:
            isLoading || optionName === "" || !anyChanges || confirmationShow,
        }}
        loading={loading}
        secondaryActions={
          optionId
            ? [
                {
                  content: "Delete",
                  onAction: () => setConfirmationShow(true),
                  disabled: isLoading || confirmationShow,
                  destructive: true,
                },
                {
                  content: "Cancel",
                  onAction: handleClose,
                  disabled: isLoading || confirmationShow,
                },
              ]
            : [
                {
                  content: "Cancel",
                  onAction: handleClose,
                  disabled: isLoading || confirmationShow,
                },
              ]
        }
      >
        {isLoading ? (
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
            <Loading text="Saving option..." />
          </div>
        ) : (
          <>
            {anyError && (
              <Modal.Section>
                <Banner title="Error" status="critical">
                  {error}
                </Banner>
              </Modal.Section>
            )}
            <Modal.Section>
              <Stack vertical>
                <Stack.Item>
                  <TextField
                    autoFocus
                    label="Option name"
                    id="optionName"
                    value={optionName}
                    onChange={(value) => {
                      setOptionName(value);
                      setAnyChanges(value !== "" && value !== initialName);
                    }}
                  />
                </Stack.Item>
                <Stack.Item>
                  <Label id="imageLabel">Option image</Label>
                  <DropZone allowMultiple={false} onDrop={handleDropZoneDrop}>
                    <ImageUpload file={file} initialImage={preview} />
                  </DropZone>
                </Stack.Item>
                {(file || preview) && (
                  <Stack.Item>
                    <Button
                      plain
                      destructive
                      onClick={() => {
                        setFile(undefined);
                        setPreview(undefined);
                      }}
                    >
                      Remove image
                    </Button>
                  </Stack.Item>
                )}
              </Stack>
              <div style={{ margin: "2rem 0 1rem 0" }}>
                <TextStyle variation="strong">Sayduck options</TextStyle>
              </div>
              {sayduckListOptions ? (
                <SayduckOptionSelection />
              ) : (
                <span>
                  Set correct <b>Sayduck Id</b> by closing this dialog and
                  pressing <i>Edit details</i>.
                </span>
              )}
            </Modal.Section>
          </>
        )}
      </Modal>
      <ConfirmationModal
        active={confirmationShow}
        yesCallback={() => handleDelete()}
        cancelCallback={() => setConfirmationShow(false)}
        itemType="option"
        itemName={optionName}
        type="delete"
      />
    </>
  );
};

export default EditOptionModal;

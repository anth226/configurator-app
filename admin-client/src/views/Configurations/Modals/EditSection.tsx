import {
  Button,
  Modal,
  Stack,
  TextField,
  DropZone,
  Banner,
  Label,
} from "@shopify/polaris";
import { EditMinor } from "@shopify/polaris-icons";
import { useCallback, useEffect, useState } from "react";
import { useImages, useSections } from "../../../api/api";
import ConfirmationModal from "../../../components/confirmation/confirmationModal";
import ImageUpload from "../../../components/imageUpload";
import Loading from "../../../components/loading/Loading";

const EditSectionModal = (props: {
  meta: string;
  sectionId?: string;
  initialName?: string;
  initialImageId?: string;
  callback: VoidFunction;
  hidden?: boolean;
  disabled?: boolean;
}) => {
  const {
    meta,
    sectionId,
    initialName = "",
    initialImageId,
    callback,
    disabled = false,
  } = props;
  const [active, setActive] = useState<boolean>(false);
  const [sectionName, setSectionName] = useState<string>(initialName);
  const [file, setFile] = useState<File>();
  const [preview, setPreview] = useState<string>();
  const {
    newSection,
    updateSection,
    deleteSection,
    loading,
    errorUpdateSection,
  } = useSections({
    meta: meta,
    callback: callback,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [anyChanges, setAnyChanges] = useState(false);
  const [anyError, setAnyError] = useState(false);
  const [confirmationShow, setConfirmationShow] = useState(false);

  useEffect(() => {
    setSectionName(initialName);
  }, [initialName]);

  const uploadCallback = (meta: string, fileUrl: string) => {
    if (sectionId) {
      updateSection({
        id: sectionId,
        payload: {
          name: sectionName,
          photo: fileUrl,
        },
      });
    } else {
      newSection({
        name: sectionName,
        photo: fileUrl,
      });
    }
  };

  const { uploadImage, loadingImages } = useImages({
    meta: meta,
    callback: uploadCallback,
    sectionId: "new",
  });

  useEffect(() => {
    setIsLoading(loading || loadingImages);
  }, [loading, loadingImages]);

  const handleClose = () => {
    setActive(!active);
  };

  const getOptionThumbnail = (src: string) =>
    `${process.env.REACT_APP_API_HOST}images/${src}?size=original`;

  const handleModalChange = () => {
    setAnyChanges(false);
    setAnyError(false);
    if (active) {
      setSectionName("");
      setFile(undefined);
    } else {
      setSectionName(initialName);
      if (initialImageId) setPreview(getOptionThumbnail(initialImageId));
    }
    setActive(!active);
  };

  const handleDelete = async () => {
    setConfirmationShow(false);
    sectionId && (await deleteSection(sectionId));
  };

  useEffect(() => {
    if (errorUpdateSection === "Ok") {
      handleModalChange();
    } else {
      errorUpdateSection !== "" && setAnyError(true);
    }
  }, [errorUpdateSection]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    setIsLoading(true);
    if (sectionId) {
      if (file) {
        await uploadImage(meta, file);
        handleModalChange();
      } else {
        if (!preview) {
          await updateSection({
            id: sectionId,
            payload: {
              name: sectionName,
              photo: "", // remove image
            },
          });
        } else {
          updateSection({
            id: sectionId,
            payload: {
              name: sectionName,
            },
          });
        }
      }
    } else {
      if (file) {
        await uploadImage(meta, file);
        setActive(!active);
      } else {
        await newSection({
          name: sectionName,
        });
      }
    }
  };

  const activator = (
    <div style={props.hidden ? { visibility: "hidden" } : {}}>
      <Button
        id="addSection"
        plain
        icon={sectionId && EditMinor}
        onClick={() => {
          handleModalChange();
        }}
        disabled={disabled}
      >
        {!sectionId ? "Add section" : ""}
      </Button>
    </div>
  );

  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) => {
      setAnyChanges(true);
      setFile(() => acceptedFiles[0]);
    },
    []
  );

  return (
    <>
      <Modal
        activator={activator}
        open={active}
        onClose={handleClose}
        title="Add section"
        primaryAction={{
          content: "Save",
          onAction: handleSave,
          disabled:
            isLoading || !anyChanges || sectionName === "" || confirmationShow,
        }}
        secondaryActions={
          sectionId
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
            <Loading text="Saving section..." />
          </div>
        ) : (
          <>
            {anyError && (
              <Modal.Section>
                <Banner title="Error" status="critical">
                  {errorUpdateSection}
                </Banner>
              </Modal.Section>
            )}
            <Modal.Section>
              <Stack vertical>
                <Stack.Item>
                  <TextField
                    autoFocus
                    label="Section name"
                    id="sectionName"
                    value={sectionName}
                    onChange={(value) => {
                      setSectionName(value);
                      setAnyChanges(value !== "" && value !== initialName);
                    }}
                  />
                </Stack.Item>
                <Stack.Item>
                  <Label id="imageSectionLabel">Section image</Label>
                  <DropZone allowMultiple={false} onDrop={handleDropZoneDrop}>
                    <ImageUpload file={file} initialImage={preview} />
                  </DropZone>
                </Stack.Item>
                {(file || preview) && (
                  <Stack.Item>
                    <Button
                      plain
                      onClick={() => {
                        setFile(undefined);
                        setPreview(undefined);
                        setAnyChanges(true);
                      }}
                    >
                      Remove image
                    </Button>
                  </Stack.Item>
                )}
              </Stack>
            </Modal.Section>
          </>
        )}
      </Modal>
      <ConfirmationModal
        active={confirmationShow}
        yesCallback={() => handleDelete()}
        cancelCallback={() => setConfirmationShow(false)}
        itemType="section"
        itemName={sectionName}
        type="delete"
      />
    </>
  );
};

export default EditSectionModal;

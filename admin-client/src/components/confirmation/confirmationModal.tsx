import { Modal, Stack } from "@shopify/polaris";

const ConfirmationModal = (props: {
  active: boolean;
  cancelCallback: VoidFunction;
  noCallback?: VoidFunction;
  yesCallback?: VoidFunction;
  type?: "save" | "delete";
  itemType?: string;
  itemName?: string;
}) => {
  const {
    noCallback,
    yesCallback,
    cancelCallback,
    active,
    type = "save",
    itemName,
    itemType,
  } = props;

  const handleClose = () => {
    cancelCallback();
  };

  const handleNo = async () => {
    noCallback && noCallback();
  };

  const handleYes = async () => {
    yesCallback && yesCallback();
  };

  const title =
    type === "delete" ? "Delete " + itemName + "?" : "Unsaved changes";

  return (
    <Modal
      open={active}
      onClose={handleClose}
      title={title}
      primaryAction={{
        content:
          type === "delete" ? "Delete " + itemType : "Discard all changes",
        onAction: type === "delete" ? handleYes : handleNo,
        destructive: true,
      }}
      secondaryActions={[
        {
          content: type === "delete" ? "Cancel" : "Continue editing",
          onAction: cancelCallback,
        },
      ]}
    >
      <Modal.Section>
        <Stack vertical>
          <Stack.Item>
            {type === "delete" ? (
              <span>
                Are you sure you want to delete the {itemType}{" "}
                <strong>{itemName}</strong>? This can’t be undone.
              </span>
            ) : (
              "Any unsaved changes will be lost."
            )}
          </Stack.Item>
        </Stack>
      </Modal.Section>
    </Modal>
  );
};

export default ConfirmationModal;
